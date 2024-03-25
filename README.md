# Smart Money Bot

This project is a telegram bot designed to monitor and notify users about 
Smart-Money Wallets transactions on the Ethereum blockchain.

## Technologies Used

- TypeScript
- NestJS
- TypeORM
- PostgreSQL
- Telegraf
- ethers.js
- TronWeb

## Services

- `WalletBotService`: Handles user management and notifications.
- `TronService`: Handles Tron related operations.
- `EthereumService`: Monitors Ethereum blockchain for transactions.

## TODO
- Add tests
- Move from websocket to http approach for transaction monitoring
- Add wallets statistics (top performers, etc)

## License

[MIT](https://choosealicense.com/licenses/mit/)