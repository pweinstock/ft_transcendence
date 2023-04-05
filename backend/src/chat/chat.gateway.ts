import {
    ConnectedSocket, MessageBody, OnGatewayConnection,
    OnGatewayDisconnect, OnGatewayInit, SubscribeMessage,
    WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';
import {ChatService} from "./chat.service";
import { CreateMessageDto } from './message/dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import {Message} from "./message/message.entity";
import {DeleteMessageDto} from "./dto/delete-message.dto";
import {JoinChatDto} from "./dto/join-chat.dto";
import {HttpException, HttpStatus, Req, UseGuards} from "@nestjs/common";
import {AuthGuard} from '@nestjs/passport';


const CHAT_PORT = Number(process.env.CHAT_PORT) || 5001;

@WebSocketGateway(CHAT_PORT, {
	namespace: 'chat',
	cors: {	origin: '*' },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
    server : Server;

    constructor(private readonly chatService : ChatService) {}


    afterInit(server: Server) {}

    handleDisconnect(@ConnectedSocket() client: Socket) {
        this.chatService.disconnectClient(client);
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : JoinChatDto
    ) : Promise <void> {
        const chat = await this.chatService.joinChat(dto, client);
        client.join(String(chat.id));
        const user = this.chatService.getClientRoom(client.id).user;
        this.server.to(String(chat.id)).emit('system', `${user.displayName}: joined the ${chat.name}`);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, data: { room: string }) {
        const user = this.chatService.getClientRoom(client.id).user;
        console.log(`${user.displayName} left ${data.room}`);
        client.leave(data.room);
    }

    @SubscribeMessage('message')
    @UseGuards(AuthGuard('2FA'))
    async createMessage (
        @Req() request: any,
        @MessageBody() dto : CreateMessageDto,
  	    @ConnectedSocket() client : Socket
    ) : Promise <Message> {
        if (!request)
            throw new HttpException('Something go wrong with request!', HttpStatus.BAD_REQUEST);
        const chat = await this.chatService.findChatById(dto.chatId);
        const message = await this.chatService.createMessage(request.user, chat, dto.content);
  	    this.server.to(String(chat.id)).emit('message', message.content);
  	    return message;
    }

    // @SubscribeMessage('getChatMessages')
    // @UseGuards(AuthGuard('2FA'))
    // async findChatMessages(
    //     @Req() request: any,
    //     @MessageBody('chatId') chatId : number
    // ) : Promise<Message[]> {
  	//     const chat = await this.chatService.findChatById(chatId);
  	//     if (!chat.users.includes(request.user.id))
  	//         throw new HttpException('user is not in this chat', HttpStatus.FORBIDDEN);
  	//     return chat.messages;
    // }

    @SubscribeMessage('removeMessage')
    @UseGuards(AuthGuard('2FA'))
    remove(
        @Req() request: any,
        @MessageBody() dto : DeleteMessageDto
    ) : void {
        if (!request)
            throw new HttpException('Something go wrong with request!', HttpStatus.BAD_REQUEST);
  	    this.chatService.removeMessage(dto, request.user);
    }
}