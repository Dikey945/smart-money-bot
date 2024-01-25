import {forwardRef, Module} from '@nestjs/common';
import {ApiController} from './api.controller';
import {ApiService} from './api.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../entities/user.entity';
import {ClientGroup} from '../entities/client-group.entity';
import {Address} from '../entities/address.entity';
import {EthereumModule} from '../ethereum/ethereum.module';
import {EventsModule} from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ClientGroup, Address]),
    forwardRef(() => EthereumModule),
    EventsModule
  ],
  controllers: [ApiController],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}