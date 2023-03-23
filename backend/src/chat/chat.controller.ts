import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDTO } from './dto/create-chat.dto';
import {DeleteChatDTO} from "./dto/delete-chat.dto";
import {ChangeStatusDTO} from "./dto/change-status.dto";
import {User} from "../users/user.entity";
import {Message} from "./message/message.entity";

@Controller('chat')
export class ChatController {
    constructor (private chatService: ChatService) {}

    @Post('create')
    create(@Body() dto: CreateChatDTO) {
        return this.chatService.createChat(dto);
    }

    @Post('delete')
    delete(@Body() dto: DeleteChatDTO) {
        return this.chatService.deleteChat(dto);
    }

    @Get('/:id/users')
    async getUserChats(@Param('id') chatId: number) :Promise<User[]> {
        const chat = await this.chatService.findChatById(chatId);
        return chat.users;
    }

    @Get('/:id')
    async getMessages(@Param('id') chatId : number) : Promise<Message[]>{
        const chat = await this.chatService.findChatById(chatId);
        return chat.messages;
    }

    @Get()
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