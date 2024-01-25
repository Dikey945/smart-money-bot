import { WalletBotService } from './wallet-bot.service';
import {Action, Command, InjectBot, On, Start, Update} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../types/types';
import {createWelcomeMessage} from './utils/welcome-message';
import {confirmFollowButtons, followButtons} from './wallet-bot-buttons';

@Update()
export class WalletBotUpdate {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,

    private readonly walletBotService: WalletBotService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    console.log("chat", ctx.chat);
    console.log("from", ctx.from);
    await this.walletBotService.createOrUpdateUser(ctx.from, ctx.chat);
    const welcomeMessage = createWelcomeMessage(ctx.from.first_name);
    const channels = await this.walletBotService.getChannelsList();
    console.log(channels);
    if (channels) {
      await ctx.reply(welcomeMessage, followButtons(channels));
    }
  }

  @Action(/join_(.+)/)
  async onJoinChannel( ctx: Context) {
    const match = ctx.callbackQuery?.['data'].match(/join_(.+)/);
    if (match) {
      const channelId = parseInt(match[1], 10);
      const inviteLink = await this.walletBotService.getChannelInviteLink(channelId);

      if (inviteLink) {
        await ctx.reply(`Join the channel: ${inviteLink}`, confirmFollowButtons(channelId));
      } else {
        await ctx.reply('Sorry, I could not find the invite link.');
      }
    }
  }

  @Action(/confirm_(.+)/)
  async onConfirmFollow(ctx: Context) {
    const match = ctx.callbackQuery?.['data'].match(/confirm_(.+)/);
    if (match) {
      const channelId = parseInt(match[1], 10);
      const result = await this.walletBotService.updateUserFollowChannels(this.bot, ctx.from.id, channelId);
      if (result) {
        await ctx.reply('Красавчик, далі більше!');
      } else {
        await ctx.reply('Не пизди, йди й підписуйся!');
      }
    }
  }

  @Command('info')
  async infoCommand(ctx: Context) {
    const isChatMemberFollow = await this.walletBotService.checkUserFollowAllChannels(this.bot, ctx.from.id);
    console.log(isChatMemberFollow);
    await ctx.reply('info');
  }

  @Command('check')
  async checkCommand(ctx: Context) {
    const result = await this.walletBotService.checkUserFollowAllChannels(this.bot, ctx.from.id);
    console.log(result);
    await ctx.reply('check');
  }

  @On('message')
  async onMessage(ctx: Context) {
    console.log('Received a message: ', ctx.message);
    // await this.walletBotService.consoleApiKeys();
    // You can also log specific parts of the message, like:
    // console.log('Message text: ', ctx.message.text);
  }

}
