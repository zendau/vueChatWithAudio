import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  constructor(private readonly appService: AppService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log('user connected');
  }

  handleDisconnect() {
    console.log('user disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any) {
    console.log(payload);
    this.appService.addUser(payload);
    //this.server.sockets.emit('answer', 'hello');
  }

  @SubscribeMessage('room')
  roomEvent(client: any, payload: any) {
    console.log(payload);
    const room = this.appService.getRoomUser(payload);
    this.server.sockets.emit('answer', room);
  }
}
