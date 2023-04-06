import {Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDTO } from './dto/create-chat.dto';
import {ChangeStatusDTO} from "./dto/change-status.dto";
import {User} from "../users/user.entity";
import {Message} from "./message/message.entity";
import {AuthGuard} from '@nestjs/passport';
import {Chat} from "./chat.entity";
import {CreateMessageDto} from "./message/dto/create-message.dto";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {JoinChatDto} from "./dto/join-chat.dto";


@Controller('chat')
export class ChatController {
    constructor (private chatService: ChatService) {}

    @Get('/all')
    getAllchats() {
        return this.chatService.findAllChats();
    }// todo for testing only delete later

    @Get()
    @UseGuards(AuthGuard('2FA'))
    async getUserChats(@Req() request) : Promise<Chat[]> {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        const chats = await this.chatService.getUserChats(request.user);
        return chats;
    }

    @Post()
    @UseGuards(AuthGuard('2FA'))
    async create(@Req() request, @Body() dto: CreateChatDTO) : Promise<Chat> {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        const chat = await this.chatService.createChat(request.user, dto);
        return chat;
    }

    @Post('/delete')
    @UseGuards(AuthGuard('2FA'))
    delete(@Req() request, @Body() chatId : number) : void {
        this.chatService.deleteChat(request.user, chatId);
    }

    @Post('/join')
    @UseGuards(AuthGuard('2FA'))
    async joinChat(@Req() request, @Body() dto : JoinChatDto) : Promise<Chat> {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        const chat = this.chatService.joinChat(request.user, dto);
        return chat;
    }

    @Get('/users/:id')
    @UseGuards(AuthGuard('2FA'))
    async getUsersInChat(@Param('id') chatId: number) : Promise<User[]> {
        const users = await this.chatService.findChatUsers(chatId);
        return users;
    }

    @Post('/addUser')
    @UseGuards(AuthGuard('2FA'))
    addUser(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.addUser(request.user.id, dto);
    }

    @Get('/id/:id')
    @UseGuards(AuthGuard('2FA'))
    async getChat(@Req() request, @Param('id') chatId : number) : Promise<Chat>{
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        if (!request.user.chats.includes(Number(chatId)))
            throw new HttpException('You are not in the Chat!', HttpStatus.BAD_REQUEST);
        const chat = await this.chatService.findChatById( chatId);
        return chat;
    }

    // MESSAGES
    @Get('/messages/:id')
    @UseGuards(AuthGuard('2FA'))
    async getMessages(@Req() request, @Param('id') chatId : number) : Promise<Message[]>{
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        const messages = await this.chatService.getChatMessages(request.user, chatId);
        return messages;
    }

    @Post('/messages')
    @UseGuards(AuthGuard('2FA'))
    async newMessage(@Req() request, @Body() dto : CreateMessageDto) : Promise<Message> {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        const message = await this.chatService.createMessage(request.user, dto);
        return message;
    }

    @Post('/messages/delete')
    @UseGuards(AuthGuard('2FA'))
     deleteMessage(@Req() request, @Body() dto : DeleteMessageDto) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.deleteMessage(request.user, dto);
    }

    // ROLES
    @Post('/admin')
    @UseGuards(AuthGuard('2FA'))
    addAdmin(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.addAdmin(request.user.id, dto);
    }

    @Post('/removeAdmin')
    @UseGuards(AuthGuard('2FA'))
    removeAdmin(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.removeAdmin(request.user.id, dto);
    }

    @Post('/ban')
    @UseGuards(AuthGuard('2FA'))
    ban(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.banUser(request.user.id, dto);
    }

    @Post('/unban')
    @UseGuards(AuthGuard('2FA'))
    unban(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.unbanUser(request.user.id, dto);
    }

    @Post('/mute')
    @UseGuards(AuthGuard('2FA'))
    mute(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.muteUser(request.user.id, dto);
    }

    @Post('/unmute')
    @UseGuards(AuthGuard('2FA'))
    unmute(@Req() request, @Body() dto: ChangeStatusDTO) : void {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        this.chatService.unmuteUser(request.user.id, dto);
    }
}