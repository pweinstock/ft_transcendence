import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserService} from 'src/users/user.service';
import {Repository} from 'typeorm';
import {Chat, ChatType, MutedUser} from './chat.entity';
import {ChangeStatusDTO} from './dto/change-status.dto';
import {CreateChatDTO} from './dto/create-chat.dto';
import {DeleteChatDTO} from "./dto/delete-chat.dto";
import {JoinChatDto} from "./dto/join-chat.dto";
import {CreateMessageDto} from "./dto/create-message.dto";
import {MessageService} from "./message/message.service";
import {DeleteMessageDto} from "./dto/delete-message.dto";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        private userServices: UserService,
        private messageServices: MessageService
    ) {
    }

    //USER INTERRACTION
    async addAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (chat.owner != dto.adminId && !isAdmin)
            throw new HttpException('For Admins only!', HttpStatus.FORBIDDEN);
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        if (!chat.admins.includes(user.id)) {
            chat.admins.push(user.id);
            await this.chatRepository.save(chat);
        }
    }

    async removeAdmin(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        if (chat.owner != dto.adminId || chat.owner == dto.userId)
            throw new HttpException('Cant do it!', HttpStatus.FORBIDDEN);
        chat.admins = chat.admins.filter((admin) => admin != dto.userId);
        await this.chatRepository.save(chat);
    }

    async changeOwner(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        if (chat.owner != dto.adminId)
            throw new HttpException('Only owner can do it!', HttpStatus.FORBIDDEN);
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        chat.owner = user.id;
        await this.chatRepository.save(chat);
    }

    async banUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (dto.userId == chat.owner || (chat.owner != dto.adminId && !isAdmin))
            throw new HttpException('You cant do it!', HttpStatus.FORBIDDEN);
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        const adminToBan = chat.admins.includes(dto.userId);
        if (adminToBan && dto.adminId != chat.owner)
            throw new HttpException('Only for channel owner!', HttpStatus.FORBIDDEN);
        if (!chat.bannedUsers.includes(dto.userId)) {
            chat.bannedUsers.push(dto.userId);
            await this.chatRepository.save(chat);
        }
    }

    async muteUser(dto: ChangeStatusDTO) : Promise<void> {
        if (!dto.timeoutMinutes)
            return;
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (dto.userId == chat.owner || (chat.owner != dto.adminId && !isAdmin))
            throw new HttpException('You cant do it!', HttpStatus.FORBIDDEN);
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
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
        await this.chatRepository.save(chat);
    }

    async addUser(dto: ChangeStatusDTO) : Promise<void> {
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        const isAdmin = chat.admins.includes(dto.adminId);
        if (chat.owner !== dto.adminId && !isAdmin)
            throw new HttpException('For Admins only!', HttpStatus.FORBIDDEN);
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        if (!chat.users.includes(user)) {
            chat.users.push(user);
            await this.chatRepository.save(chat);
        }
    }

    async joinChat(dto : JoinChatDto) {
        const user = await this.userServices.findById(dto.userId);
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        const chat = await this.chatRepository.findOneBy({id: dto.chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);
        if (chat.users.includes(user))
            return;
        switch (chat.type) {
            case ChatType.PUBLIC:
                chat.users.push(user);
                break;
            case ChatType.PROTECTED:
                if (chat.password == dto.password)
                    chat.users.push(user);
                else
                    throw new HttpException('Wrong Password!', HttpStatus.FORBIDDEN);
                break;
            default:
                throw new HttpException('No access rights!', HttpStatus.NOT_FOUND);
        }
        await this.chatRepository.save(chat);
    }

    // CHAT INTERRACTION
    async createChat(dto: CreateChatDTO) : Promise<Chat> {
        if (dto.type == ChatType.PROTECTED && !dto.password)
            throw new HttpException('Password not provided!', HttpStatus.BAD_REQUEST);
        const owner = await this.userServices.findById(dto.owner);
        if (!owner)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        const chat = this.chatRepository.create(dto);
        chat.users = chat.users || [];
        chat.admins = chat.admins || [];
        chat.mutedUsers = [];
        chat.bannedUsers = [];
        chat.messages = [];
        chat.users.push(owner);
        chat.admins.push(owner.id);
        return this.chatRepository.save(chat);
    }

    async deleteChat(dto: DeleteChatDTO): Promise<void> {
        const owner = await this.userServices.findById(dto.owner);
        if (!owner)
            throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        const chat = await this.getChatById(dto.chatId);
        if (chat.owner != dto.owner)
            throw new HttpException('Not allowed!', HttpStatus.FORBIDDEN);
        await this.chatRepository.delete(dto.chatId);
    }

    async getChatById(chatId: number): Promise<Chat> {
        const chat = await this.chatRepository.findOneBy({id: chatId});
        if (!chat)
            throw new HttpException('Chat not found!', HttpStatus.BAD_REQUEST);
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

        const chat = await this.getChatById(dto.chatId);
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
        const chat = await this.getChatById(dto.chatId);
        if(!chat)
            throw new HttpException('Chat not found!', HttpStatus.NOT_FOUND);

        chat.messages = chat.messages.filter((msg) => msg.id != dto.messageId);
        this.chatRepository.save(message);
        this.userServices.deleteMessage(message.id, user);
        return message;
    }
}