import { EntityHelper } from '../utils/entity-helper';
import {Column, Entity, Index, ManyToMany} from 'typeorm';
import {User} from './user.entity';
@Entity('client_group')
export class ClientGroup extends EntityHelper {
  @Column('bigint',{unique: true})
  @Index()
  channelId?: number;

  @Column()
  channelName?: string;

  @Column()
  link?: string;

  @Column({nullable: true})
  counter?: string;

  @Column()
  maxFollowerValue?: number;

  @Column()
  ownerId?: number;

  @ManyToMany(() => User, user => user.clientGroups)
  users: User[];
}