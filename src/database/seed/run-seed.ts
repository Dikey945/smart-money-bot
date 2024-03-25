import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SeedModule } from './seed.module';
import {AddressesSeedService} from './address/addresses-seed.service';
import {DataSource} from 'typeorm';


const runSeed = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    SeedModule,
    new FastifyAdapter(),
  );

  await app.get(AddressesSeedService).run();
  await app.close();
};

runSeed();
