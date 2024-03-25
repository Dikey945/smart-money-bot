import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import {Address} from '../../../entities/address.entity';
import {AddressesSeedService} from './addresses-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  providers: [AddressesSeedService],
  exports: [AddressesSeedService],
})
export class AddressesSeedModule {}