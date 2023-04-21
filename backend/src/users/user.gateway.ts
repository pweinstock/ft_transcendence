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


@WebSocketGateway(Number(process.env.USER_PORT), {
    namespace: "user",
    cors: {	origin: '*' },
})
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly userService: UserService) {}

    afterInit(server: Server) {}

    handleConnection() {}

    handleDisconnect(@ConnectedSocket() client: Socket) {
        this.userService.userDisconnect(client.id);
    }

    @SubscribeMessage('connect')
    async createGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : UserInfoDto
    ): Promise<void> {
        this.userService.userConnect(client.id, dto);
    }

    @SubscribeMessage('update')
    userUpdate() {
        this.server.emit('userUpdate');
    }
}
