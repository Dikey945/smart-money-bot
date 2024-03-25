import {Injectable} from '@nestjs/common';
import {Address} from '../../../entities/address.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AddressesSeedService {
  private readonly databaseType: string = this.configService.get<string>('database.type');
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,

    private configService: ConfigService,
  ) {

  }

  async run() {
    console.log('Is database connected?', await this.addressRepository.manager.connection.isConnected);

    console.log('Database type:', this.databaseType);
    const csvFilePath = path.join(__dirname, '..', 'address-seeds.csv');
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
        this.prepareAndInsert(data);
      })
      .on('end', () => {
        console.log('Addresses have been seeded successfully.');
      });
  }

  private async prepareAndInsert(data: Address): Promise<void> {
    try {
      const randomAddress = await this.addressRepository.findOne(
        {
          where: { description: "my address"},
        }
      );
      console.log('Seeding address:', data['﻿address']);
      const existingAddress = await this.addressRepository.findOne({
        where: { address: '0xB8DBb7bEfEBb40d86F637A772F20CF4ea806c8Cb' },
      });
      console.log('Existing address:', existingAddress);

      if (!existingAddress) {
        const address = new Address();
        address.address = data.address;
        address.description = data.description; // Adjust as needed
        address.winRate = data.winRate;
        address.PnL = data.PnL;
        await this.addressRepository.save(address);
      } else {
        // Optionally update the existing record or simply skip
        console.log(`Address ${data.address} already exists. Skipping.`);
      }
    } catch (error) {
      console.error(`Error seeding address ${data['﻿address']}: ${error.message}`);
    }

  }
}