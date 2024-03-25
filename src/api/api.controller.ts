import {Body, Controller, Get, Post} from '@nestjs/common';
import {ApiService} from './api.service';
import {createClientGroupRequest} from './api.pb';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  async getHello() {
    return 'Hello World!';
  }

  @Post('/client-group')
  async createClientGroup(@Body() body: createClientGroupRequest) {
    return this.apiService.createClientGroup(body);
  }

  @Get('/users')
  async getAllUsers() {
    return this.apiService.getAllUsersWithChannels();
  }

  @Post('/address')
  async createAddress(@Body() body: any) {
    return this.apiService.addAddress(body.address, body.description);
  }

  @Get('/add-seeds')
  async addUsersFromCsv () {
    return this.apiService.addUsersFromCsv();
  }

  @Get('/addresses')
  async getAddressCount() {
    return this.apiService.getAddressCount();
  }
}