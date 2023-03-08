import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// @Injectable()
// export class ChatService {
//     constructor(@InjectRepository(Chat) private chatRepository: Repository<Chat>) {}

//     async createChat(dto: CreateChatDTO) {
//         const chat = await this.chatRepository.create(dto);
//         chat.owner = dto.userId;
//         return this.chatRepository.save(chat);
//     }

//     async getUserChat(chatId : number) : Promise<Chat> {
//         const chat = await this.chatRepository.findOneBy({id : chatId});
//         return chat;
//     }

//     async addAdmin( dto: ChangeStatusDTO) {
//         const chat = await this.chatRepository.findOneBy({id : dto.chatId});
//         if (!chat)
//             throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
//         const isAdmin = chat.admins.includes(dto.adminId);
//         if (chat.owner !== dto.adminId && !isAdmin)
//             throw new HttpException('Access denied!', HttpStatus.FORBIDDEN);
//         if (chat.admins.includes(dto.userId))
//             chat.admins.push(dto.userId);
//     }

//     async banUser(dto: ChangeStatusDTO) {
//         const chat = await this.chatRepository.findOneBy({id : dto.chatId});
//         if (!chat)
//             throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
//         const isAdmin = chat.admins.includes(dto.adminId);
//         if (chat.owner !== dto.adminId && !isAdmin)
//             throw new HttpException('Access denied!', HttpStatus.FORBIDDEN);
//         if (chat.bannedUsers.includes(dto.userId))
//             chat.bannedUsers.push(dto.userId);
//     }

//     async muteUser(dto: ChangeStatusDTO) {
//         const chat = await this.chatRepository.findOneBy({id : dto.chatId});
//         if (!chat)
//             throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
//         const isAdmin = chat.admins.includes(dto.adminId);
//         if (chat.owner !== dto.adminId && !isAdmin)
//             throw new HttpException('Access denied!', HttpStatus.FORBIDDEN);
//         if (chat.mutedUsers.includes(dto.userId))
//             chat.mutedUsers.push(dto.userId);
//     }
// }
