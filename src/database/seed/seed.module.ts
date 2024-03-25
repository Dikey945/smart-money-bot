import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { TypeOrmConfigService } from '../typeorm-config.service';
import {AddressesSeedModule} from './address/addresses-seed.module';
import botConfig from '../../config/bot.config';

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
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        console.log("database initialized");
        return dataSource;
      },
    }),
    AddressesSeedModule
  ],
})
export class SeedModule {}
