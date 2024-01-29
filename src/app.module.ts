import { Module } from '@nestjs/common';
// import { AppUpdate } from './app.update';
// import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule, ConfigService } from '@nestjs/config';
import botConfig from './config/bot.config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { Expenses } from './entities/expenses.entity';
// import { Income } from './entities/income.entity';
import { DataSource } from 'typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { WalletBotModule } from './wallet-bot/wallet-bot.module';
import {ApiModule} from './api/api.module';
import {EthereumModule} from './ethereum/ethereum.module';
import {EventsModule} from './events/events.module';
import databaseConfig from './config/database.config';

const sessions = new LocalSession({ database: 'sessions.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
      load: [botConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        return new DataSource(options).initialize();
      },
    }),
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        console.log(configService.get<string>('bot.token'));
        return {
          middlewares: [sessions.middleware()],
          token: configService.get<string>('bot.token'),
        };
      },
      inject: [ConfigService],
    }),
    EventsModule,
    ApiModule,
    EthereumModule,
    WalletBotModule
  ],
})
export class AppModule {}
