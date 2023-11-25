import { registerAs } from '@nestjs/config';

export default registerAs('bot', () => ({
  token: process.env.BOT_TOKEN,
}));
