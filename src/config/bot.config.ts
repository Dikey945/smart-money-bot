import { registerAs } from '@nestjs/config';

export default registerAs('bot', () => ({
  token: process.env.BOT_TOKEN,
  apiKeyMainnet: process.env.API_KEY_MAINNET,
  apiKeyEtherscan: process.env.API_KEY_ETHERSCAN
}));
