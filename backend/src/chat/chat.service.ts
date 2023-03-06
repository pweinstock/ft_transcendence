import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { ChangeStatusDTO } from './dto/change-status.dto';
import { CreateChatDTO } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
    constructor(@InjectRepository(Chat) private chatRepository: Repository<Chat>) {}

    async createChat(dto: CreateChatDTO) {
        const chat = await this.chatRepository.create(dto);
        chat.owner = dto.userId;
        return this.chatRepository.save(chat);
    }

    async getUserChat(id : number) : Promise<Chat> {
        const chat = await this.chatRepository.findOneBy({id});
        return chat;
    }

    async addAdmin( dto: ChangeStatusDTO) {
        const chat = await this.chatRepository.findOneBy({id : dto.chatId});
        if (!chat)
            return null;
        const userExists = chat.admins.includes(dto.userId);
        if (!userExists) {
          chat.admins.push(dto.userId);
          return 'added';
        }
        return 'exists';
    }

    async banUser(dto: ChangeStatusDTO) {
        const chat = await this.chatRepository.findOneBy({id : dto.chatId});
        if (!chat)
            return null;
        const userExists = chat.bannedUsers.includes(dto.userId);
        if (!userExists) {
          chat.admins.push(dto.userId);
          return 'added';
        }
        return 'exists';
    }

    async muteUser(userId : number) {
        
    }
}
