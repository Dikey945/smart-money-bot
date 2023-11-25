import { WalletBotService } from './wallet-bot.service';
import {Action, Command, InjectBot, On, Start, Update} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../types/types';
import {createWelcomeMessage} from './utils/welcome-message';

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
    await ctx.reply(welcomeMessage);
  }

  @Command('info')
  async infoCommand(ctx: Context) {
    const chatMember = await this.walletBotService.checkGroupMembership(this.bot, ctx.from.id);
    console.log(chatMember);
    await ctx.reply('info');
  }

  @On('message')
  onMessage(ctx: Context) {
    console.log('Received a message: ', ctx.message);
    // You can also log specific parts of the message, like:
    // console.log('Message text: ', ctx.message.text);
  }

}
