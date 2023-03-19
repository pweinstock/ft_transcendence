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
        chat.admins.push(owner.id);
        return this.chatRepository.save(chat);
    }

    async deleteChat(dto: DeleteChatDTO): Promise<void> {
        const owner = await this.userServices.findById(dto.owner);
        if (!owner)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        const chat = await this.findChatById(dto.chatId);
        if (chat.owner != dto.owner)
            throw new HttpException('Not allowed!', HttpStatus.FORBIDDEN);
        await this.chatRepository.delete(dto.chatId);
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
    checkRights(chat : Chat, userId : number) {
        if (chat.owner !== userId && !chat.admins.includes(userId))
            throw new HttpException('For Admins only!', HttpStatus.FORBIDDEN);
    }

    async addUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        if(chat.type === ChatType.DIRECT && chat.users.length > 1)
            throw new HttpException('Max 2 users is allowed in DM!', HttpStatus.FORBIDDEN);
        this.checkRights(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
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
        if (chat.bannedUsers.includes(user.id))
            throw new HttpException('No access rights!', HttpStatus.FORBIDDEN);
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
        this.userServices.addChat(user, chat.id);
        return this.chatRepository.save(chat);
    }

    async addAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkRights(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        if (chat.users.includes(user) && !chat.admins.includes(user.id)) {
            chat.admins.push(user.id);
            this.chatRepository.save(chat);
        }
    }

    async removeAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkRights(chat, dto.adminId);
        if (chat.owner === dto.userId)
            throw new HttpException('Not enough rights!', HttpStatus.FORBIDDEN);
        chat.admins = chat.admins.filter((admin) => admin != dto.userId);
        this.chatRepository.save(chat);
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
        this.checkRights(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        if (!chat.bannedUsers.includes(user.id)) {
            chat.bannedUsers.push(user.id);
            this.chatRepository.save(chat);
        }
    }

    async unbanUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkRights(chat, dto.adminId);
        chat.bannedUsers = chat.bannedUsers.filter(user => user != dto.userId);
        this.chatRepository.save(chat);
    }

    async muteUser(dto: ChangeStatusDTO) : Promise<void> {
        if (!dto.timeoutMinutes)
            return;
        const chat = await this.findChatById(dto.chatId);
        if (dto.userId === chat.owner)
            throw new HttpException('Not enough rights!', HttpStatus.FORBIDDEN);
        this.checkRights(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        const mutedUser = chat.mutedUsers.find((mutedUsr) => mutedUsr.userId === user.id);
        if (mutedUser)
            mutedUser.unmuteDate = new Date(Date.now() + dto.timeoutMinutes * 60000);
        else {
            const newMutedUser: MutedUser = {
                userId: dto.userId,
                unmuteDate: new Date(Date.now() + dto.timeoutMinutes * 60000),
            };
            chat.mutedUsers.push(newMutedUser);
        }
        this.chatRepository.save(chat);
    }

    async unmuteUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.findChatById(dto.chatId);
        this.checkRights(chat, dto.adminId);
        const user = await this.userServices.findById(dto.userId);
        const mutedUser = chat.mutedUsers.find((mutedUsr) => mutedUsr.userId === user.id);
        if (mutedUser) {
            chat.mutedUsers = chat.mutedUsers.filter(users => user.id !== users.userId)
            this.chatRepository.save(chat);
        }
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

    async createMessage(dto : CreateMessageDto, socketId : string) {
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);

        const chat = await this.findChatById(dto.chatId);
        if(!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);

        const message = await this.messageServices.createMessage(dto);
        message.displayName = user.displayName;
        chat.messages.push(message);
        this.chatRepository.save(message);
        this.userServices.addMessage(message.id, user);
        return message;
    }

    async removeMessage(dto : DeleteMessageDto) {
        const message = await this.messageServices.findMessageById(dto.messageId);
        if (!message)
            throw new HttpException('Message not found!', HttpStatus.NOT_FOUND);
        if (message.user != dto.userId)
            throw new HttpException('Message not belongs to you!', HttpStatus.BAD_REQUEST);
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        const chat = await this.findChatById(dto.chatId);
        if(!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);

        chat.messages = chat.messages.filter((msg) => msg.id != dto.messageId);
        this.chatRepository.save(message);
        this.userServices.deleteMessage(message.id, user);
        return message;
    }
}