import { Chat } from './../chat/entities/chat.entity';
import { ChatService } from './../chat/chat.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMessageDTO } from './dto/message.dto';
import { IUpdateMessageDTO } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

interface test {
  status: boolean;
  message: string;
  httpCode: HttpStatus;
}

interface test2 {
  chat: Chat;
  authorLogin: string;
  text: string;
  id: number;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private chatService: ChatService,
  ) {}
  async create(createMessageDTO: IMessageDTO) {
    // TODO : Проверка пользователя на принадлежность к чату

    const chatData = await this.chatService.getChatById(
      createMessageDTO.chatId,
    );

    if (chatData instanceof Chat) {
      const resInsered = await this.messageRepository.save({
        chat: chatData,
        authorLogin: createMessageDTO.authorLogin,
        text: createMessageDTO.text,
      });
      return resInsered;
    } else {
      return chatData;
    }
  }

  async getAllByChat(chatId: number) {
    // TODO: Пагинация

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.chat', 'chat')
      .where('chat.id = :chatId', { chatId })
      // .skip()
      // .take()
      .getMany();

    const messagesWithLogin = await Promise.all(
      messages.map(async (message: any) => {
        const userData = await this.chatService.getUserName(message.authorId);
        console.log('userData', userData);
        message.login = userData[0].login;
        console.log('message', message);
        return message;
      }),
    );

    return messagesWithLogin;
  }

  async getById(messageId: number) {
    const res = await this.messageRepository
      .createQueryBuilder()
      .where('id = :messageId', { messageId })
      .getOne();

    if (res === undefined)
      return {
        status: false,
        message: `messageId ${messageId} is not valid`,
        httpCode: HttpStatus.BAD_REQUEST,
      };

    return res;
  }

  async update(updateMessageDTO: IUpdateMessageDTO) {
    const res = await this.messageRepository
      .createQueryBuilder()
      .update()
      .set({
        text: updateMessageDTO.text,
      })
      .where(`id = ${updateMessageDTO.id}`)
      .execute();

    return !!res.affected;
  }

  async remove(id: number) {
    const res = await this.messageRepository
      .createQueryBuilder()
      .delete()
      .where(`id = ${id}`)
      .execute();

    return !!res.affected;
  }
}
