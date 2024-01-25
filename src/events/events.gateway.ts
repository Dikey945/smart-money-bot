import {WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  constructor() {
    console.log('EventsGateway instance created');
  }

  // You can define functions here that emit events to your socket
  emitTransactionAlert(alertMessage: string): void {
    if (!this.server) {
      return;
    }
    this.server.emit('tr', alertMessage);
  }
}