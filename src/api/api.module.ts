import { Module } from '@nestjs/common';
import {ApiController} from './api.controller';
import {ApiService} from './api.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../entities/user.entity';
import {ClientGroup} from '../entities/client-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ClientGroup])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}