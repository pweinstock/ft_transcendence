import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserService} from 'src/users/user.service';
import {Repository} from 'typeorm';
import {Chat, ChatType, MutedUser} from './chat.entity';
import {ChangeStatusDTO} from './dto/change-status.dto';
import {CreateChatDTO} from './dto/create-chat.dto';
import {DeleteChatDTO} from "./dto/delete-chat.dto";
import {JoinChatDto} from "./dto/join-chat.dto";
import {MessageService} from "./message/message.service";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {Message} from "./message/message.entity";
import {User, UserStatus} from "../users/user.entity";
import { Socket } from 'socket.io';

interface Room {
    user : User,
    chatId : number
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
        const chat = this.chatRepository.create(dto);
        chat.owner = owner.id;
        chat.admins = [];
        chat.bannedUsers = [];
        // chat.mutedUsers = new Array<MutedUser>(); //todo find solution for this
        chat.users = [];
        chat.messages = [];
        chat.users.push(owner.id);
        await this.chatRepository.save(chat);
        await this.userServices.addChat(owner, chat.id);
        return chat;
    }

    async deleteChat(dto: DeleteChatDTO): Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner !== dto.owner)
            throw new HttpException('Not Allowed!', HttpStatus.FORBIDDEN);
        chat.users.forEach(user => this.userServices.deleteChat(user, chat.id));
        chat.messages.forEach(message => {
            this.messageServices.deleteMessage(message);
        });
        this.chatRepository.remove(chat);
    }

    async findChatById(chatId: number): Promise<Chat> {
        const chat = await this.chatRepository.findOneBy({id: chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        return chat;
    }

    //todo remove later(only debugging function)
    async findAllChats(): Promise<Chat[]> {
        const chats = await this.chatRepository.find();
        return chats;
    }

    async findChatUsers(chatId : number) : Promise<User[]> {
        // const users = await this.userServices.findUsersByIds(chat.users);
        // return users;
        const chat = await this.findChatById(chatId);
        const users: User[] = [];
        for (const id of chat.users) {
            const user = await this.userServices.findById(id);
            users.push(user);
        }
        return users;
    }

    // async findUsersChats(userId : number): Promise<Chat[]> {
    //     const chats = await this.chatRepository.find();
    //     return chats.filter((user) => user.id == userId);
    // }


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

    async addUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, dto.adminId);
        this.checkBan(chat, dto.userId);
        const user = await this.userServices.findById(dto.userId);
        if(chat.type === ChatType.DIRECT) {
            if (chat.users.length > 1)
                throw new HttpException('Max 2 users is allowed in DM!', HttpStatus.FORBIDDEN);
            if (user.bannedUsers.includes(dto.adminId))
                throw new HttpException('You are banned by user!', HttpStatus.FORBIDDEN);
        }
        if (!chat.users.includes(user.id)) {
            this.userServices.addChat(user, chat.id);
            chat.users.push(user.id);
            this.chatRepository.save(chat);
        }
    }

    async joinChat(dto : JoinChatDto, client : Socket) : Promise<Chat> {
        const user = await this.userServices.findById(dto.userId);
        const chat = await this.findChatById(dto.chatId);
        this.userServices.changeStatus(user, UserStatus.ONLINE);
        if (chat.users.length != 0 && chat.users.includes(user.id)) {
            this.identify(user, client, chat.id);
            return chat;
        }
        if (chat.admins.includes(user.id))
            chat.users.push(user.id);
        else {
            this.checkBan(chat, user.id);
            switch (chat.type) {
                case ChatType.PUBLIC:
                    chat.users.push(user.id);
                    break;
                case ChatType.PROTECTED:
                    if (chat.password === dto.password)
                        chat.users.push(user.id);
                    else
                        throw new HttpException('Wrong Password!', HttpStatus.FORBIDDEN);
                    break;
                default:
                    throw new HttpException('No access rights!', HttpStatus.FORBIDDEN);
            }
        }
        this.userServices.addChat(user, chat.id);
        this.identify(user, client, chat.id);
        this.chatRepository.save(chat);
        return chat;
    }

    async addAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner === dto.userId)
            return;
        this.checkAdmin(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        if (chat.users.includes(user.id) && !chat.admins.includes(user.id)) {
            this.removeBan(chat, user.id);
            this.removeMute(chat, user.id);
            chat.admins.push(user.id);
            this.chatRepository.save(chat);
        }
    }

    async removeAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, dto.adminId);
        if (chat.admins.includes(dto.userId)) {
            chat.admins = chat.admins.filter((admin) => admin != dto.userId);
            this.chatRepository.save(chat);
        }
    }

    async changeOwner(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner !== dto.adminId)
            throw new HttpException('Only owner can do it!', HttpStatus.FORBIDDEN);
        const user = await this.userServices.findById(dto.userId);
        chat.owner = user.id;
        this.chatRepository.save(chat);
    }

    async banUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (dto.userId === chat.owner)
            throw new HttpException('Not enough rights!', HttpStatus.FORBIDDEN);
        this.checkAdmin(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        this.addBan(chat, user.id);
    }

    async unbanUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, dto.adminId);
        this.removeBan(chat, dto.userId);
    }

    async muteUser(dto: ChangeStatusDTO) : Promise<void> {
        if (!dto.timeoutMinutes)
            return;
        const chat = await this.findChatById(dto.chatId);
        if (dto.userId === chat.owner)
            throw new HttpException('Not enough rights!', HttpStatus.FORBIDDEN);
        this.checkAdmin(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        this.addMute(chat, user.id, dto.timeoutMinutes);
    }

    async unmuteUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkAdmin(chat, dto.adminId);
        this.removeMute(chat, dto.userId);
    }

    //Message Interraction


    private clienttoUser = new Map<string, Room>();

    identify (newUser : User, client : Socket, chatID : number) : void {
        this.disconnectClient(client);
        this.clienttoUser.set(client.id, {user : newUser, chatId : chatID});
    }

    disconnectClient(client : Socket) : void {
        if (this.clienttoUser.has(client.id)) {
            const room = this.getClientRoom(client.id);
            client.leave(String(room.chatId));
            this.clienttoUser.delete(client.id);
        }
    }

    getClientRoom(clientId : string) : Room {
        const room = this.clienttoUser.get(clientId);
        if (!room)
            throw new HttpException('You are not registered in this room!', HttpStatus.FORBIDDEN)
        return room;
    }

    async createMessage(user : User, chat : Chat, newMessage: string) : Promise<Message> {
        if (chat.bannedUsers.includes(user.id))
            throw new HttpException('You are banned in this chat!', HttpStatus.BAD_REQUEST);
        if (this.isMuted(chat, user.id))
            throw new HttpException('You are muted!', HttpStatus.BAD_REQUEST);
        const message = await this.messageServices.createMessage ({ content : newMessage, userId : user.id, chatId : chat.id});
        message.displayName = user.displayName;
        chat.messages.push(message.id);
        this.chatRepository.save(message);
        return message;
    }

    async removeMessage(dto : DeleteMessageDto, user : User) : Promise<void> {
        const message = await this.messageServices.findMessageById(dto.messageId);
        if (message.user != user.id)
            throw new HttpException('Message not belongs to user!', HttpStatus.FORBIDDEN);
        const chat = await this.findChatById(dto.chatId);
        chat.messages = chat.messages.filter((messageId) => messageId != dto.messageId);
        this.chatRepository.save(message);
    }

    //Helpers
    checkAdmin(chat : Chat, userId : number) {
        if (chat.owner !== userId && !chat.admins.includes(userId))
            throw new HttpException('For Admins only!', HttpStatus.FORBIDDEN);
    }

    checkBan(chat : Chat, userId : number) {
        if (chat.bannedUsers.includes(userId))
            throw new HttpException('User Banned in this chat!', HttpStatus.FORBIDDEN);
    }

    addBan(chat : Chat, userId : number) {
        if (!chat.bannedUsers.includes(userId)) {
            chat.bannedUsers.push(userId);
            this.chatRepository.save(chat);
        }
    }

    removeBan(chat : Chat, userId: number) {
        if (chat.bannedUsers.includes(userId)) {
            chat.bannedUsers.filter(user => user !== userId);
            this.chatRepository.save(chat);
        }
    }

    addMute(chat : Chat, userId: number, timeoutMinutes : number) {
        const mutedUser = chat.mutedUsers.find((muted) => muted.userId === userId);
        if (mutedUser) {
            chat.mutedUsers = chat.mutedUsers.filter(muted => muted.userId !== userId);
            const newMutedUser: MutedUser = {
                userId: userId,
                unmuteDate: new Date(Date.now() + timeoutMinutes * 60000),
            };
            chat.mutedUsers.push(newMutedUser);
        }
    }

    removeMute(chat : Chat, userId: number) {
        const mutedUser = chat.mutedUsers.find((muted) => muted.userId === userId);
        if (mutedUser) {
            chat.mutedUsers = chat.mutedUsers.filter(muted => muted.userId !== userId);
            this.chatRepository.save(chat);
        }
    }

    isMuted(chat : Chat, userId : number) : boolean {
        const mutedUser = chat.mutedUsers.find((muted) => muted.userId === userId);
        if (mutedUser) {
            const currentDate = new Date();
            if (mutedUser.unmuteDate >= currentDate)
                return true;
            chat.mutedUsers = chat.mutedUsers.filter(muted => muted.userId !== userId);
            this.chatRepository.save(chat);
        }
        return false;
    }
}

