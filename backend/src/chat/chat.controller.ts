import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDTO } from './dto/create-chat.dto';
import {DeleteChatDTO} from "./dto/delete-chat.dto";

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

    @Get('/:id')
    getChat(@Param('id') id: number) {
        return this.chatService.getChatById(id);
    }
}
