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
import {GameService} from "./game.service";
import {GameDataDto} from "./dto/game-data.dto";
import {JoinGameDto} from "./dto/join-game.dto";
import {GameScoreDto} from "./dto/game-score.dto";


@WebSocketGateway(Number(process.env.GAME_PORT) | 5002, {
    namespace: "game",
    transports: ["websocket"],
    cors: {	origin: '*' },
})

export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server : Server;

    constructor(private readonly gameService: GameService) {}

    afterInit(server: Server) {}

    handleConnection() {}

    handleDisconnect(@ConnectedSocket() client: Socket) {
        if (this.gameService.isPlayer(client.id)) {
            const gameId = this.gameService.getGameId(client.id);
            if (this.gameService.isStarted(gameId))
                this.server.to(gameId).emit("disconnect", gameId);
            else {
                this.gameService.deletePlayer(client.id);
                this.gameService.deleteGame(gameId);
            }
        }
        else
            this.gameService.deleteViewer(client.id);
    }

    @SubscribeMessage('create')
    async createGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() displayName : string
    ) : Promise<void> {
        const gameId = await this.gameService.newGame(client.id, displayName);
        if (gameId) {
            client.join(gameId);
            this.server.to(gameId).emit('newGame',);
        }
    }

    @SubscribeMessage('join')
    async joinGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : JoinGameDto
    ) : Promise<void> {
        const status = await this.gameService.joinGame(client.id, dto);
        client.join(dto.gameId);
        this.server.to(dto.gameId).emit(status, dto.gameId);
    }

    @SubscribeMessage('view')
    async viewGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() gameId : string
    ) : Promise<void> {
        const status = await this.gameService.viewGame(client.id, gameId);
        if (status === true)
            client.join(gameId);
    }

    @SubscribeMessage('KeyUp')
    onKeyUp(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameDataDto
    ) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            if (clientRoom.isFirst)
                dto.leftPaddle.dy = 0;
            else
                dto.rightPaddle.dy = 0;
            this.server.to(clientRoom.gameId).emit("update", dto);
        }
    }

    @SubscribeMessage('wKey')
    wKeyPressed(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameDataDto
    ) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            if (clientRoom.isFirst)
                dto.leftPaddle.dy = - dto.paddleSpeed;
            else
                dto.rightPaddle.dy = - dto.paddleSpeed;
            this.server.to(clientRoom.gameId).emit("update", dto);
        }
    }

    @SubscribeMessage('sKey')
    sKeyPressed(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameDataDto
    ) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            if (clientRoom.isFirst)
                dto.leftPaddle.dy = dto.paddleSpeed;
            else
                dto.rightPaddle.dy = dto.paddleSpeed;
            this.server.to(clientRoom.gameId).emit("update", dto);
        }
    }

    @SubscribeMessage('end')
    gameEnd(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameScoreDto
    ) : void {
        const isEnded = this.gameService.endOfGame(client.id, dto);
        if (isEnded)
            this.server.to(dto.gameId).emit('finished', dto.gameId);
        client.leave(dto.gameId);
    }

    @SubscribeMessage('leave')
    leaveGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameScoreDto
    ) : void {
        const isEnded = this.gameService.endOfGame(client.id, dto);
        if (isEnded)
            this.server.to(dto.gameId).emit('finished', dto.gameId);
        this.gameService.deleteViewer(client.id);
        client.leave(dto.gameId);
    }
}