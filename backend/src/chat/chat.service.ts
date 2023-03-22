import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserService} from 'src/users/user.service';
import {Repository} from 'typeorm';
import {Chat, ChatType, MutedUser} from './chat.entity';
import {ChangeStatusDTO} from './dto/change-status.dto';
import {CreateChatDTO} from './dto/create-chat.dto';
import {DeleteChatDTO} from "./dto/delete-chat.dto";
import {JoinChatDto} from "./dto/join-chat.dto";
import {CreateMessageDto} from "./message/dto/create-message.dto";
import {MessageService} from "./message/message.service";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {Message} from "./message/message.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        private userServices: UserService,
        private messageServices: MessageService
    ) {}

    // CHAT INTERRACTION
    async createChat(dto: CreateChatDTO) : Promise<Chat> {
        if (dto.type == ChatType.PROTECTED && !dto.password)
            throw new HttpException('Wrong data provided!', HttpStatus.BAD_REQUEST);
        const owner = await this.userServices.findById(dto.owner);
        if (!owner)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        const chat = this.chatRepository.create(dto);
        chat.admins = [];
        chat.bannedUsers = [];
        // chat.mutedUsers = new Array<MutedUser>(); //todo find solution for this
        chat.users = [];
        chat.messages = [];
        chat.users.push(owner);
        this.chatRepository.save(chat);
        return chat;
    }

    async deleteChat(dto: DeleteChatDTO): Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner !== dto.owner)
            throw new HttpException('Not Allowed!', HttpStatus.FORBIDDEN);
        chat.users.forEach(user => this.userServices.deleteChat(user, chat.id));
        chat.messages.forEach(async message => {
            this.messageServices.deleteMessage(message.id);
            const user = await this.userServices.findById(message.user);
            this.userServices.deleteMessage(message.id, user);
        });
        await this.chatRepository.remove(chat);
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

    async findUserChats(userId : number): Promise<Chat[]> {
        const chats = await this.chatRepository.find();
        return chats.filter((user) => user.id == userId);
    }


    //USER INTERRACTION

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
        if (!chat.users.includes(user)) {
            this.userServices.addChat(user, chat.id);
            chat.users.push(user);
            this.chatRepository.save(chat);
        }
    }

    async joinChat(dto : JoinChatDto) : Promise<Chat> {
        const user = await this.userServices.findById(dto.userId);
        const chat = await this.findChatById(dto.chatId);
        if (chat.users.includes(user))
            return chat;
        if (chat.admins.includes(user.id))
            chat.users.push(user);
        else {
            this.checkBan(chat, user.id);
            switch (chat.type) {
                case ChatType.PUBLIC:
                    chat.users.push(user);
                    break;
                case ChatType.PROTECTED:
                    if (chat.password === dto.password)
                        chat.users.push(user);
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

    async addAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner === dto.userId)
            return;
        this.checkAdmin(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        if (chat.users.includes(user) && !chat.admins.includes(user.id)) {
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
    clienttoUser = {}
    async identify (userId : number, clientId : string) {
        const user = await this.userServices.findById(userId);
        this.clienttoUser[clientId] = user.displayName;
        return Object.values(this.clienttoUser);
    }

    getClientName(clientId : string) {
        return this.clienttoUser[clientId];
    }

    async createMessage(dto : CreateMessageDto, socketId : string) : Promise<Message> {
        const user = await this.userServices.findById(dto.userId);
        const chat = await this.findChatById(dto.chatId);
        if (chat.bannedUsers.includes(user.id))
            throw new HttpException('You are banned in this chat!', HttpStatus.BAD_REQUEST);
        if (this.isMuted(chat, user.id))
            throw new HttpException('You are muted!', HttpStatus.BAD_REQUEST);
        const message = await this.messageServices.createMessage(dto);
        message.displayName = user.displayName;
        chat.messages.push(message);
        this.chatRepository.save(message);
        this.userServices.addMessage(message.id, user);
        return message;
    }

    async removeMessage(dto : DeleteMessageDto) : Promise<void> {
        const message = await this.messageServices.findMessageById(dto.messageId);
        if (message.user != dto.userId)
            throw new HttpException('Message not belongs to user!', HttpStatus.BAD_REQUEST);
        const user = await this.userServices.findById(dto.userId);
        const chat = await this.findChatById(dto.chatId);
        chat.messages = chat.messages.filter((msg) => msg.id != dto.messageId);
        this.chatRepository.save(message);
        this.userServices.deleteMessage(message.id, user);
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

