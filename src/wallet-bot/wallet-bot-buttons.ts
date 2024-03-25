import { Markup } from 'telegraf';

export const followButtons = (channels) => {
const buttons = channels.map((channel) => {
    return Markup.button.callback(channel.channelName, `join_${channel.channelId}`);
  });
  return Markup.inlineKeyboard(buttons, { columns: 1 });
}

export const  confirmFollowButtons = (channelId: number) => {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('Готово', `confirm_${channelId}`),
    ],
    { columns: 2 },
  );
}

export const subscribeButtons = () => {
  return Markup.keyboard(
    [Markup.button.text('Підписатися')],
    { columns: 1 },
  );
}
