import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDTO } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
    constructor (private chatService: ChatService) {}

    @Post()
    create(@Body() dto: CreateChatDTO) {
        return this.chatService.createChat(dto);
    }

    @Get('/:id')
    getChatById(@Param('id') id: number) {
        return this.chatService.getUserChat(id);
    }
}
