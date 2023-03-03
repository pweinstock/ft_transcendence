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
        const user = chat.admins.find(dto.userId, );
        if (!user)
            
        return user;
    }

    async banUser(userId : number) {
        
    }

    async muteUser(userId : number) {
        
    }
}
