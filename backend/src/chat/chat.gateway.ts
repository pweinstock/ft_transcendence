import {
    ConnectedSocket, MessageBody, OnGatewayConnection,
    OnGatewayDisconnect, OnGatewayInit, SubscribeMessage,
    WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';
import {ChatService} from "./chat.service";
import { CreateMessageDto } from './message/dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import {JoinChatDto} from "./dto/join-chat.dto";

@WebSocketGateway(Number(process.env.SOCKET_PORT), {
	namespace: 'chat',
	cors: {	origin: '*' },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    afterInit() {}

    handleDisconnect(@ConnectedSocket() client: Socket) {
        this.chatService.disconnectClient(client);
    }

    async handleConnection(@ConnectedSocket() client: Socket) {}

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: JoinChatDto
    ): Promise<void> {
        this.chatService.identify(client.id, dto);
        client.join(dto.chatId);
        }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket): void {
        this.chatService.disconnectClient(client);
    }

    @SubscribeMessage('message')
    createMessage(
        @MessageBody() dto: CreateMessageDto,
        @ConnectedSocket() client: Socket
    ): void {
        if (this.chatService.clientInChat(client.id, dto))
            this.server.to(dto.chatId).emit('message', dto);
    }

    @SubscribeMessage('delete')
    deleteMessage(
        @MessageBody() dto: CreateMessageDto,
        @ConnectedSocket() client: Socket
    ): void {
        this.server.to(dto.chatId).emit('delete', dto);
    }
}