import {Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDTO } from './dto/create-chat.dto';
import {DeleteChatDTO} from "./dto/delete-chat.dto";
import {ChangeStatusDTO} from "./dto/change-status.dto";
import {User} from "../users/user.entity";
import {Message} from "./message/message.entity";
import {AuthGuard} from '@nestjs/passport';
import {Chat} from "./chat.entity";


@Controller('chat')
export class ChatController {
    constructor (private chatService: ChatService) {}

    @Post('create')
    @UseGuards(AuthGuard('2FA'))
    async create(@Req() request, @Body() dto: CreateChatDTO) {
        const chat = await this.chatService.createChat(request.user, dto);
        return chat;
    }

    @Post('delete')
    delete(@Body() dto: DeleteChatDTO) {
        return this.chatService.deleteChat(dto);
    }

    @Get('/:id/users')
    async getUsersInChat(@Param('id') chatId: number) :Promise<User[]> {
        const chat = await this.chatService.findChatById(chatId);
        return chat.users;
    }

    @Get()
    @UseGuards(AuthGuard('2FA'))
    async getUserChats(@Req() request) : Promise<Chat[]> {
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        const chats = await this.chatService.getUserChats(request.user);
        return chats;
    }

    @Get('/id/:id')
    @UseGuards(AuthGuard('2FA'))
    async getMessages(@Req() request, @Param('id') chatId : number) : Promise<Chat>{
        if (!request || !request.user)
            throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
        if (!request.user.includes(chatId))
            throw new HttpException('You are not in the Chat!', HttpStatus.BAD_REQUEST);
        const chat = await this.chatService.findChatById( chatId);
        return chat;
    }

    @Get('/all')
    getAllchats() {
        return this.chatService.findAllChats();
    }

    @Post('admin')
    addAdmin(@Body() dto: ChangeStatusDTO) {
        return this.chatService.addAdmin(dto);
    }

    @Post('ban')
    ban(@Body() dto: ChangeStatusDTO) {
        return this.chatService.banUser(dto);
    }

    @Post('mute')
    mute(@Body() dto: ChangeStatusDTO) {
        return this.chatService.muteUser(dto);
    }
}