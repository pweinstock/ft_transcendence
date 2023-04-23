import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {UserService} from "./user.service";
import {UserInfoDto} from "./dto/user-info.dto";


@WebSocketGateway(Number(process.env.SOCKET_PORT), {
    namespace: "user",
    cors: {	origin: '*' },
})
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly userService: UserService) {}

    afterInit(server: Server) {
    }

    handleConnection() {
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        await this.userService.userDisconnect(client.id);
    }

    @SubscribeMessage('userConnect')
    async newUser(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : UserInfoDto
    ): Promise<void> {
        // console.log("connect requested");

        if (dto && dto.userId) {
            // console.log("connect accepted");
            await this.userService.userConnect(client.id, dto);
        }
    }

    @SubscribeMessage('userUpdate')
    userUpdate(@ConnectedSocket() client: Socket) {
        // console.log("update requested");
        if (this.userService.isConnected(client.id)) {
            // console.log("update sended");
            this.server.emit('userUpdate');
        }
    }
}
