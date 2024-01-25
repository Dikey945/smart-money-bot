import {EthereumService} from './ethereum.service';
import {forwardRef, Module} from '@nestjs/common';
import {ApiModule} from '../api/api.module';
import {EventsModule} from '../events/events.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../entities/user.entity';
import {ClientGroup} from '../entities/client-group.entity';
import {Address} from '../entities/address.entity';
import {WalletBotModule} from '../wallet-bot/wallet-bot.module';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ClientGroup, Address]),
    forwardRef(() => ApiModule),
    EventsModule,
    WalletBotModule,
    HttpModule
  ],
  providers: [EthereumService],
  exports: [EthereumService],
})
export class EthereumModule {}