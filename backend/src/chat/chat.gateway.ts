import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {ChatService} from "./chat.service";
import { CreateMessageDto } from './message/dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import {Message} from "./message/message.entity";
import {DeleteMessageDto} from "./dto/delete-message.dto";

const CHAT_PORT = Number(process.env.CHAT_PORT) || 5001;
@WebSocketGateway(CHAT_PORT, {
	namespace: 'chat',
	cors: {	origin: '*' },
})

export class ChatGateway {
	@WebSocketServer()
    server : Server;

    constructor(private readonly chatService : ChatService) {}

    @SubscribeMessage('message')
    async create(
        // @MessageBody() dto : string,
        @MessageBody() dto : CreateMessageDto,
  	    @ConnectedSocket() client : Socket
        ) {
  	    const message = await this.chatService.createMessage(dto, client.id);
  	    this.server.emit('message', dto);
  	    return dto;
    }

    @SubscribeMessage('findChatMessages')
    async findChatMessages(@MessageBody('chatId') chatId : number) : Promise<Message[]>{
  	    const chat = await this.chatService.findChatById(chatId);
  	    return chat.messages;
    }

    @SubscribeMessage('removeMessage')
    remove( @MessageBody() dto : DeleteMessageDto ) {
  	    this.chatService.removeMessage(dto);
    }

    @SubscribeMessage('join')
    joinRoom(
  	    @MessageBody('user') userId : number,
    	@ConnectedSocket() client : Socket
        ) {
  	    return this.chatService.identify(userId, client.id);
    }
}