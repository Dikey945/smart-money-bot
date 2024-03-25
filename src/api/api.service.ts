import {forwardRef, Inject, Injectable} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGroup } from '../entities/client-group.entity';
import {createClientGroupRequest} from './api.pb';
import {Address} from '../entities/address.entity';
import {EthereumService} from '../ethereum/ethereum.service';
import * as path from 'path';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClientGroup)
    private clientGroupRepository: Repository<ClientGroup>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,

    @Inject(forwardRef(() => EthereumService))
    private ethereumService: EthereumService,
  ) {}

  async createClientGroup(clientGroup: createClientGroupRequest): Promise<ClientGroup> {
    const newClientGroup = {
      ...clientGroup
    }
    return this.clientGroupRepository.save(newClientGroup);
  }

  async getAllAddresses(): Promise<string[]> {
    try{
      const fullAddresses = await this.addressRepository.find();
      return fullAddresses.map(address => address.address)
    } catch (e) {
      console.log(e)
    }
  }

  async getAddressCount(): Promise<number> {
    try{
      return this.addressRepository.count();
    } catch (e) {
      console.log(e)
    }
  }

  async addAddress(address: string, description: string): Promise<Address> {
    try{
      const newAddress = {
        address,
        description
      }
      const savedAddress = await this.addressRepository.save(newAddress);
      this.ethereumService.addAddress(address);
      return savedAddress;
    }catch (e) {
      console.log(e)
    }
  }

  async getAllUsersWithChannels(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['clientGroups'],
      select: ['userTgId', 'firstName', 'clientGroups']
    });
  }

  async addUsersFromCsv() {
    const csvFilePath = path.join(__dirname, '..', 'database', 'seed', 'address-seeds.csv');
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
        this.prepareAndInsert(data);
      })
      .on('end', () => {
        console.log('Addresses have been seeded successfully.');
        return true
      });
  }

  async prepareAndInsert(data: Address): Promise<boolean> {
    try {
      // console.log('Data:', data);
      // console.log('Seeding address:', data['﻿address']);

      const winRate = data.winRate
      const PnL = data.PnL
      console.log('WinRate:', winRate);
      console.log('PnL:', PnL);
      const existingAddress = await this.addressRepository.findOne({
        where: { address: data['﻿address'] },
      });
      // console.log('Existing address:', existingAddress);

      if (!existingAddress) {
        const address = new Address();
        address.address = data['﻿address'];
        address.description = data.description; // Adjust as needed
        address.winRate = data.winRate;
        address.PnL = data.PnL;
        await this.addressRepository.save(address);
        return true
      } else {
        // Optionally update the existing record or simply skip
        // console.log(`Address ${data['﻿address']} already exists. Skipping.`);
        return false
      }
    } catch (error) {
      console.error(`Error seeding address ${data['﻿address']}: ${error.message}`);
      console.log("Data:", data);
    }

  }
}