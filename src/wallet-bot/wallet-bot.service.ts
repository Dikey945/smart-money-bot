import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { Context, Telegraf } from 'telegraf';
import { ChatMember } from '../types/types';
import {ExtraPromoteChatMember} from 'telegraf/typings/telegram-types';
import {ClientGroup} from '../entities/client-group.entity';


@Injectable()
export class WalletBotService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(ClientGroup)
    private clientGroupRepository: Repository<ClientGroup>,
  ) {}

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

  async checkGroupMembership(bot: Telegraf<Context>, userId: number): Promise<ChatMember> {
    try {
      const chatId = -1001942079083;
      return await bot.telegram.getChatMember(chatId, userId);
    } catch (e) {
      console.log(e)
      return null;
    }
  }
}
