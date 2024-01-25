import {forwardRef, Inject, Injectable, OnApplicationBootstrap, OnModuleInit} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { Context, Telegraf } from 'telegraf';
import { ChatMember } from '../types/types';
import {ExtraPromoteChatMember} from 'telegraf/typings/telegram-types';
import {ClientGroup} from '../entities/client-group.entity';
import {ConfigService} from '@nestjs/config';
import {EventsGateway} from '../events/events.gateway';
import {InjectBot} from 'nestjs-telegraf';


@Injectable()
export class WalletBotService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(ClientGroup)
    private clientGroupRepository: Repository<ClientGroup>,

    private configService: ConfigService,

    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,

    @InjectBot()
    private readonly bot: Telegraf<Context>,
  ) {}

  async sendMessageToAllUsers(message: string): Promise<void> {
    const users = await this.userRepository.find(); // Fetch all users

    users.forEach(user => {
      // Assuming each user has a 'chatId' or similar field
      this.sendMessage(user.chatId, message);
    });
  }

  sendMessage(chatId: number, message: string): void {
    try {
      this.bot.telegram.sendMessage(
        chatId,
        message,
        {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        });
    } catch (e) {
      console.log(e);
    }
  }

  async createUser(user: any, chat: any): Promise<User> {
    const newUser = {
      userTgId: user.id,
      firstName: user.first_name,
      userTag: user.username,
      chatId: chat.id,
      isPremium: user.is_premium
    };
    return this.userRepository.save(newUser);
  }

  async consoleApiKeys() {
    console.log(this.configService.get<string>('bot.apiKeyMainnet'));
  }

  async isUserExist(userId: number): Promise<boolean> {
    const findUser = await this.userRepository.findOne({
      where: {
        userTgId: userId,
      },
    });
    return !!findUser;
  }

  async createOrUpdateUser(user: any, chat: any): Promise<User> {
    const findUser = await this.userRepository.findOne({
      where: {
        userTgId: user.id,
      },
    });
    if (!findUser) {
      return this.createUser(user, chat);
    }
    findUser.firstName = user.first_name;
    findUser.userTag = user.username;
    findUser.chatId = chat.id;
    findUser.isPremium = user.is_premium;
    return this.userRepository.save(findUser);
  }

  async checkGroupMembership(bot: Telegraf<Context>, userId: number, channelId: number): Promise<boolean> {
    try {
      const result = await bot.telegram.getChatMember(channelId, userId);
      // return result.status === 'member';
      return result.status !== 'restricted' && result.status !== 'left' && result.status !== 'kicked';

    } catch (e) {
      console.log(e)
      return null;
    }
  }

  async updateUserFollowChannels(bot: Telegraf, userId: number, channelId: number): Promise<any> {
    try {
      const findUser = await this.userRepository.findOne({
        where: {
          userTgId: userId,
        },
        relations: ['clientGroups'], // Include clientGroups relation
      });

      if (findUser) {
        const findChannel = await this.clientGroupRepository.findOne({
          where: {
            channelId,
          },
        });

        const isFollow = await this.checkGroupMembership(bot, userId, channelId);

        if (findChannel && isFollow) {
          // Ensure clientGroups is an array
          findUser.clientGroups = Array.isArray(findUser.clientGroups) ? findUser.clientGroups : [];
          if (findUser.clientGroups.includes(findChannel)) {
            console.log("User already follow this channel");
            return;
          }

          // Add the new channel to clientGroups
          findUser.clientGroups.push(findChannel);

          // Save the updated user
          return this.userRepository.save(findUser);
        }
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async checkUserFollowAllChannels(bot: Telegraf<Context>, userId: number): Promise<boolean> {
    try {
      const channels = await this.getChannelsList()
      const checkUserFollowAllChannels = await Promise.all(channels.map(async (channel) => {
        return await this.checkGroupMembership(bot, userId, channel.channelId);
      }));
      console.log("checkUserFollowAllChannels", checkUserFollowAllChannels);
      return checkUserFollowAllChannels.every((channel) => channel);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getChannelsList() {
    try{
      return await this.clientGroupRepository
        .createQueryBuilder("client_group")
        .select(["client_group.channelId", "client_group.channelName"])
        .where("client_group.isFinished = :isFinished", { isFinished: false })
        .getMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getChannelInviteLink(channelId: number) {
    try{
      const result = await this.clientGroupRepository
        .createQueryBuilder("client_group")
        .select(["client_group.link"])
        .where("client_group.channelId = :channelId", { channelId })
        .getOne();

      return result.link;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
