import { Module } from '@nestjs/common';
import {TronService} from './tron.service';


@Module({
  imports: [],
  providers: [TronService],
  exports: [TronService],
})
export class TronModule {}