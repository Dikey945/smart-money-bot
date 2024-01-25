import {forwardRef, Inject, Injectable} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGroup } from '../entities/client-group.entity';
import {createClientGroupRequest} from './api.pb';
import {Address} from '../entities/address.entity';
import {EthereumService} from '../ethereum/ethereum.service';

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
}