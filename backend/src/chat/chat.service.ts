import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserService} from 'src/users/user.service';
import {Repository} from 'typeorm';
import {Chat, ChatType} from './chat.entity';
import {ChangeStatusDTO} from './dto/change-status.dto';
import {CreateChatDTO} from './dto/create-chat.dto';
import {JoinChatDto} from "./dto/join-chat.dto";
import {MessageService} from "./message/message.service";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {Message} from "./message/message.entity";
import {User} from "../users/user.entity";
import {Socket} from 'socket.io';
import {CreateMessageDto} from "./message/dto/create-message.dto";
import {ChatPublicDataDto} from "./dto/chat-public-data.dto";
import { NewMessageDto } from './dto/new-message.dto';
import * as bcrypt from 'bcrypt';
import { PasswordChatDto } from './dto/password-chat.dto';

interface Room {
    userId : string,
    chatId : string
}

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        private userServices: UserService,
        private messageServices: MessageService
    ) {}

    // CHAT INTERRACTION
    async createChat(owner : User, dto: CreateChatDTO) : Promise<Chat> {
        if (dto.type == ChatType.PROTECTED && !dto.password)
            throw new HttpException('Wrong data provided!', HttpStatus.BAD_REQUEST);
        if (dto.password)
            dto.password = await this.hashPassword(dto.password);
        const chat = this.chatRepository.create(dto);
        chat.owner = owner.id;
        chat.admins = [];
        chat.bannedUsers = [];
        chat.users = [];
        chat.messages = [];
        chat.mutedUsers = [];
        chat.users.push(owner.id);
        await this.chatRepository.save(chat);
        await this.userServices.addChat(owner, chat.id);
        return chat;
    }

	async addChatPassword(user : User, dto : PasswordChatDto) : Promise<void> {
		const chat = await this.findChatById(dto.chatId);
		if (chat.owner !== user.id || !dto.password)
			throw new HttpException("Not allowed!", HttpStatus.BAD_REQUEST);
		chat.type = ChatType.PROTECTED;
		chat.password = await this.hashPassword(dto.password);
		await this.chatRepository.save(chat);
	}

	async deleteChatPassword(user : User, dto : PasswordChatDto) : Promise<void> {
		const chat = await this.findChatById(dto.chatId);
		if (chat.owner !== user.id || !dto.password || chat.type != ChatType.PROTECTED)
			throw new HttpException("Not allowed!", HttpStatus.BAD_REQUEST);
		chat.type = ChatType.PUBLIC;
		chat.password = null;
		await this.chatRepository.save(chat);
	}

    async deleteChat(owner : User, chatId: string): Promise<void> {
        const chat = await this.findChatById(chatId);
        if (chat.owner !== owner.id)
            throw new HttpException('Not Allowed!', HttpStatus.FORBIDDEN);
        chat.users.forEach(user => this.userServices.deleteChat(user, chat.id));
        chat.messages.forEach(message => {
            this.messageServices.deleteMessage(message);
        });
        this.chatRepository.remove(chat);
    }

	async leaveChat(user : User, chatId: string): Promise<void> {
		await this.userServices.deleteChat(user.id, chatId);
		const chat = await this.findChatById(chatId);
		chat.users = chat.users.filter(userId => userId !== user.id);
		await this.chatRepository.save(chat);
    }

    async findChatById(chatId: string): Promise<Chat> {
        const chat : Chat = await this.chatRepository.findOneBy({id: chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        return chat;
    }



    //todo remove later(only debugging function)
    async findAll(): Promise<Chat[]> {
        const chats = await this.chatRepository.find();
        return chats;
    }

    async findAllChats(): Promise<ChatPublicDataDto[]> {
        const chats = await this.chatRepository.find();
        const visibleChats : ChatPublicDataDto[] = [];
        await Promise.all(chats.map(async (chat) => {
            if (chat.type === ChatType.PUBLIC || chat.type === ChatType.PROTECTED) {
                const owner = await this.userServices.findById(chat.owner);
                visibleChats.push({ id: chat.id, name: chat.name, type: chat.type, owner: owner.displayName });
            }
        }));
        return visibleChats;
    }

    async findChatUsers(chatId : string) : Promise<User[]> {
        const chat = await this.findChatById(chatId);
        const users: User[] = [];
        for (const id of chat.users) {
            const user = await this.userServices.findById(id);
            users.push(user);
        }
        return users;
    }


    //USER INTERRACTION
    async getUserChats(user : User) : Promise<Chat[]> {
        if (user.chats.length === 0)
            return null;
        let chats : Chat[] = await Promise.all(
            user.chats.map(async (chatId) => {
                const chat = await this.findChatById(chatId);
                return chat;
            })
        );
        return chats;
    }

    async addUser(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, adminId);
        this.checkBan(chat, dto.userId);
        const user = await this.userServices.findById(dto.userId);
        if(chat.type === ChatType.DIRECT) {
            if (chat.users.length > 1)
                throw new HttpException('Max 2 users is allowed in DM!', HttpStatus.FORBIDDEN);
            if (user.bannedUsers.includes(adminId))
                throw new HttpException('You are banned by user!', HttpStatus.FORBIDDEN);
        }
        if (!chat.users.includes(user.id)) {
            this.userServices.addChat(user, chat.id);
            chat.users.push(user.id);
            this.chatRepository.save(chat);
        }
    }

    async joinChat(user : User, dto : JoinChatDto) : Promise<Chat> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.users.length != 0 && chat.users.includes(user.id))
            return chat;
        if (chat.admins.includes(user.id))
            chat.users.push(user.id);
        else {
            this.checkBan(chat, user.id);
            switch (chat.type) {
                case ChatType.PUBLIC:
                    chat.users.push(user.id);
                    break;
                case ChatType.PROTECTED:
                    if (await bcrypt.compare( dto.password ,chat.password))
                        chat.users.push(user.id);
                    else
                        throw new HttpException('Wrong Password!', HttpStatus.FORBIDDEN);
                    break;
                default:
                    throw new HttpException('No access rights!', HttpStatus.FORBIDDEN);
            }
        }
        this.userServices.addChat(user, chat.id);
        this.chatRepository.save(chat);
        return chat;
    }

    async addAdmin(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner === dto.userId)
            return;
        this.checkAdmin(chat, adminId);
        const user = await this.userServices.findById(dto.userId);
        if (chat.users.includes(user.id) && !chat.admins.includes(user.id)) {
            this.removeBan(chat, user.id);
            this.removeMute(chat, user.id);
            chat.admins.push(user.id);
            this.chatRepository.save(chat);
        }
    }

    async removeAdmin(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, adminId);
        if (chat.admins.includes(dto.userId)) {
            chat.admins = chat.admins.filter((admin) => admin != dto.userId);
            this.chatRepository.save(chat);
        }
    }

    async banUser(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (dto.userId === chat.owner)
            throw new HttpException('Not enough rights!', HttpStatus.FORBIDDEN);
        this.checkAdmin(chat, adminId);
        const user = await this.userServices.findById(dto.userId);
        this.addBan(chat, user.id);
    }

    async unbanUser(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, adminId);
        this.removeBan(chat, dto.userId);
    }

    async muteUser(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (dto.userId === chat.owner)
        throw new HttpException('Not enough rights!', HttpStatus.FORBIDDEN);
        this.checkAdmin(chat, adminId);
        const user = await this.userServices.findById(dto.userId);
        this.addMute(chat, user.id);
    }

    async unmuteUser(adminId : string, dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, adminId);
        this.removeMute(chat, dto.userId);
    }

    //Message Interraction
    private clienttoUser = new Map<string, Room>();

    async identify (clientId : string, dto: JoinChatDto) : Promise<void> {
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (chat && chat.users.includes(dto.userId)) {
            this.clienttoUser.set(clientId, {userId: dto.userId, chatId: dto.chatId});
        
        }
    }

    clientInChat(clientId : string, dto: CreateMessageDto) : boolean {
        const room = this.clienttoUser.get(clientId);
        if (room && room.userId === dto.userId && room.chatId === dto.chatId)
            return true;
        return false;
    }

    disconnectClient(client : Socket) : void {
        if (this.clienttoUser.has(client.id)) {
            const room = this.getClientRoom(client.id);
            client.leave(String(room.chatId));
            this.clienttoUser.delete(client.id);
        }
    }

    async getChatMessages(user : User, chatId : string) : Promise<Message[]> {
        const chat = await this.findChatById(chatId);
        if (!chat.users.includes(user.id))
            throw new HttpException('You are not authorised in chat', HttpStatus.FORBIDDEN);
        const messages : Message[] = [];
        for (const messageId of chat.messages) {
            const message = await this.messageServices.findMessageById(messageId);
            messages.push(message);
        }
        return messages;
    }

    getClientRoom(clientId : string) : Room {
        const room = this.clienttoUser.get(clientId);
        return room;
    }

    async createMessage(user : User, dto : NewMessageDto) : Promise<Message> {
        if (!user.chats.includes(dto.chatId))
            throw new HttpException('Not allowed!', HttpStatus.BAD_REQUEST);
        const chat = await this.findChatById(dto.chatId);
        if (chat.bannedUsers.includes(user.id))
            throw new HttpException('You are banned in this chat!', HttpStatus.BAD_REQUEST);
        if (this.isMuted(chat, user.id))
            throw new HttpException('You are muted!', HttpStatus.BAD_REQUEST);
        const message = await this.messageServices.createMessage ({content : dto.content, chatId : chat.id, userId : user.id, displayName : user.displayName, date : dto.date});
        chat.messages.push(message.id);
        await this.chatRepository.save(chat);
        return message;
    }

    async deleteMessage(user : User, dto : DeleteMessageDto) : Promise<void> {
        const message = await this.messageServices.findMessageById(dto.messageId);
        if (message.userId != user.id)
            throw new HttpException('Message not belongs to user!', HttpStatus.FORBIDDEN);
        const chat = await this.findChatById(dto.chatId);
        chat.messages = chat.messages.filter((messageId) => messageId != dto.messageId);
        this.chatRepository.save(message);
    }

    //Helpers
    checkAdmin(chat : Chat, userId : string) : void {
        if (chat.owner !== userId && !chat.admins.includes(userId))
            throw new HttpException('For Admins only!', HttpStatus.FORBIDDEN);
    }

    checkBan(chat : Chat, userId : string) : void {
        if (chat.bannedUsers.includes(userId))
            throw new HttpException('User Banned in this chat!', HttpStatus.FORBIDDEN);
    }

    addBan(chat : Chat, userId : string) : void {
        if (!chat.bannedUsers.includes(userId)) {
            chat.bannedUsers.push(userId);
            this.chatRepository.save(chat);
        }
    }

    removeBan(chat : Chat, userId: string) : void {
        if (chat.bannedUsers.includes(userId)) {
            chat.bannedUsers.filter(user => user !== userId);
            this.chatRepository.save(chat);
        }
    }

    addMute(chat : Chat, userId: string) : void {
        if (!this.isMuted(chat, userId)) {
            chat.mutedUsers.push(userId);
            this.chatRepository.save(chat);
        }
    }

    removeMute(chat : Chat, userId: string) : void {
        if (this.isMuted(chat, userId)) {
            const index = chat.mutedUsers.indexOf(userId);
            chat.mutedUsers.splice(index, 1);
            this.chatRepository.save(chat);
        }
    }

    isMuted(chat : Chat, userId : string) : boolean {
        if (chat.mutedUsers.includes(userId))
            return true;
        return false;
    }

    async hashPassword(password : string) : Promise<string> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        const salt = await bcrypt.genSalt();
        return hash;
    }
}

