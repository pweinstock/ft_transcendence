import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/users/user.service';
import { Repository } from 'typeorm';
import { Chat, ChatType, MutedUser } from './chat.entity';
import { ChangeStatusDTO } from './dto/change-status.dto';
import { CreateChatDTO } from './dto/create-chat.dto';
import {User} from "../users/user.entity";

@Injectable()
export class ChatService {
    constructor(@InjectRepository(Chat) private chatRepository: Repository<Chat>,
                private usersServices : UserService) {}

    async addAdmin( dto: ChangeStatusDTO) {
        const chat = await this.chatRepository.findOneBy({id : dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (chat.owner !== dto.adminId && !isAdmin)
            throw new HttpException('Access denied!', HttpStatus.FORBIDDEN);
        if (chat.admins.includes(dto.userId))
            chat.admins.push(dto.userId);
    }

    async banUser(dto: ChangeStatusDTO) {
        const chat = await this.chatRepository.findOneBy({id : dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (chat.owner !== dto.adminId && !isAdmin)
            throw new HttpException('Access denied!', HttpStatus.FORBIDDEN);
        if (chat.bannedUsers.includes(dto.userId))
            chat.bannedUsers.push(dto.userId);
    }

    async muteUser(dto: ChangeStatusDTO) {
        if (!dto.timeoutMinutes)
            return;
        const chat = await this.chatRepository.findOneBy({id : dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (chat.owner !== dto.adminId && !isAdmin)
            throw new HttpException('Access denied!', HttpStatus.FORBIDDEN);
        const isAlreadyMuted = chat.mutedUsers.some((mutedUser) => mutedUser.userId === dto.userId);
        if (!isAlreadyMuted) {
            const newMutedUser: MutedUser = {
                userId: dto.userId,
                unmuteDate: new Date(Date.now() + dto.timeoutMinutes * 60000),
            };
            chat.mutedUsers.push(newMutedUser);
            await this.chatRepository.save(chat);
        }
    }

    // CHAT
    async createChat(dto: CreateChatDTO) {
        if (dto.type === ChatType.PROTECTED && !dto.password)
            throw new HttpException('Password not provided!', HttpStatus.BAD_REQUEST);
        const owner = await this.usersServices.findById(dto.owner);
        if (!owner)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        const chat = this.chatRepository.create(dto);
        chat.users.push(owner);
        return this.chatRepository.save(chat);
    }

    async getUserChat(chatId : number) : Promise<Chat> {
        const chat = await this.chatRepository.findOneBy({id : chatId});
        return chat;
    }


}
