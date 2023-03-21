import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {ChatService} from "./chat.service";
import { CreateMessageDto } from './message/dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import {Message} from "./message/message.entity";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {UserService} from "../users/user.service";
import {JoinChatDto} from "./dto/join-chat.dto";
import {User} from "../users/user.entity";



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
    async createMessage(
        @MessageBody() dto : CreateMessageDto,
  	    @ConnectedSocket() client : Socket
        ) {
  	    const message = await this.chatService.createMessage(dto);
  	    this.chatService.getClientName(client.id);
  	    this.server.emit('message', message.content);
  	    return message;
    }

    @SubscribeMessage('getChatMessages')
    async findChatMessages(@MessageBody('chatId') chatId : number) : Promise<Message[]>{
  	    const chat = await this.chatService.findChatById(chatId);
  	    return chat.messages;
    }

    @SubscribeMessage('removeMessage')
    remove( @MessageBody() dto : DeleteMessageDto ) {
  	    this.chatService.removeMessage(dto);
    }

    @SubscribeMessage('join')
    async joinRoom(
  	    @MessageBody('user') dto : JoinChatDto,
    	@ConnectedSocket() client : Socket
        ) : Promise<User> {
        const user = await this.chatService.joinChat(dto);
  	    this.chatService.identify(user, client.id);
  	    return user;
    }
}