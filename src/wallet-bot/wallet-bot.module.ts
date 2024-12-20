import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletBotService } from './wallet-bot.service';
import { WalletBotUpdate } from './wallet-bot.update';
import { User } from '../entities/user.entity';
import { ClientGroup } from '../entities/client-group.entity';
import { EventsModule } from '../events/events.module';
import { TronModule } from '../tron-payments/tron.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, ClientGroup]), EventsModule, TronModule],
  providers: [WalletBotService, WalletBotUpdate],
  exports: [WalletBotService],
})
export class WalletBotModule {}
