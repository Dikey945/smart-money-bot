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

}