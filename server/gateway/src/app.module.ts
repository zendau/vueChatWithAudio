import { RoleController } from './AuthService/RoleModule/role.controller';
import { UserController } from './AuthService/UserModule/user.controller';
import { RoomController } from './PeerService/room/room.controller';
import { FoulderController } from './FileCloudService/foulder/foulder.controller';
import { MessageController } from './ChatService/message/message.controller';
import { ChatController } from './ChatService/chat/chat.controller';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FileController } from './FileCloudService/file/file.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './AuthService/strategies/jwt.strategy';
import { RefreshStrategy } from './AuthService/strategies/refresh.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'PEER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:root@localhost:5672'],
          queue: 'peer_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'CHAT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:root@localhost:5672'],
          queue: 'chat_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'FILE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:root@localhost:5672'],
          queue: 'file_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'PEER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:root@localhost:5672'],
          queue: 'peer_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:root@localhost:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    ChatController,
    MessageController,
    FoulderController,
    FileController,
    RoomController,
    UserController,
    RoleController,
  ],
  providers: [JwtStrategy, RefreshStrategy],
})
export class AppModule {}
