import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGroup } from '../entities/client-group.entity';
import {createClientGroupRequest} from './api.pb';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClientGroup)
    private clientGroupRepository: Repository<ClientGroup>,
  ) {}

  async createClientGroup(clientGroup: createClientGroupRequest): Promise<ClientGroup> {
    const newClientGroup = {
      ...clientGroup
    }
    return this.clientGroupRepository.save(newClientGroup);
  }
}