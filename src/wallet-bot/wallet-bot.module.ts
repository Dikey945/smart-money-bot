import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletBotService } from './wallet-bot.service';
import { WalletBotUpdate } from './wallet-bot.update';
import { User } from '../entities/user.entity';
import { ClientGroup } from '../entities/client-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ClientGroup])],
  providers: [WalletBotService, WalletBotUpdate],
})
export class WalletBotModule {}
