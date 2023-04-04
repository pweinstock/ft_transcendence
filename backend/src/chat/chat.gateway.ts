import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {ChatService} from "./chat.service";
import { CreateMessageDto } from './message/dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import {Message} from "./message/message.entity";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {JoinChatDto} from "./dto/join-chat.dto";
import {User} from "../users/user.entity";
import {HttpException, HttpStatus, Req, UseGuards} from "@nestjs/common";
import {AuthGuard} from '@nestjs/passport';
import {HTTPError} from "superagent";


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
    @UseGuards(AuthGuard('2FA'))
    async createMessage(
        @Req() request: any,
        @MessageBody() newMessage : string,
  	    @ConnectedSocket() client : Socket
        ) {
        if (!request)
            throw new HttpException('Something go wrong with request!', HttpStatus.NOT_ACCEPTABLE);
        const chat = this.chatService.getClientName(client.id);
        const dto : CreateMessageDto = {
            content : newMessage,
            userId : request.user.id,
            chatId : chat.id
        }
        const message = await this.chatService.createMessage(dto);
  	    this.server.emit('message', message.content);
  	    return message;
    }
m
    @SubscribeMessage('getChatMessages')
    @UseGuards(AuthGuard('2FA'))
    async findChatMessages(@MessageBody('chatId') chatId : number) : Promise<Message[]>{
  	    const chat = await this.chatService.findChatById(chatId);
  	    return chat.messages;
    }

    @SubscribeMessage('removeMessage')
    remove( @MessageBody() dto : DeleteMessageDto ) {
  	    this.chatService.removeMessage(dto);
    }

    @SubscribeMessage('join')
    @UseGuards(AuthGuard('2FA'))
    async joinRoom(
  	    @MessageBody('user') dto : JoinChatDto,
    	@ConnectedSocket() client : Socket
        ) : Promise<User> {
        const user = await this.chatService.joinChat(dto);
  	    this.chatService.identify(user, client.id);
  	    return user;
    }
}