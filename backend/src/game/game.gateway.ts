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
import {GameOptionDto} from "./dto/game-option.dto";


@WebSocketGateway(Number(process.env.GAME_PORT), {
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
            const gameId : string = this.gameService.getPlayerGameId(client.id);
            if (gameId && this.gameService.isStarted(gameId))
                this.server.to(gameId).emit("playerDisconnected", gameId);
            else {
                this.gameService.deletePlayer(client.id);
                this.gameService.deleteGameOption(gameId);
                this.gameService.deleteGameData(gameId);
            }
        }
        this.gameService.deleteViewer(client.id);
    }

    @SubscribeMessage('create')
    async createGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() gameOptions : GameOptionDto
    ) : Promise<void> {
        const gameId = await this.gameService.newGame(client.id, gameOptions);
        if (gameId) {
            client.join(gameId);
            client.emit('created');
        }
        else
            client.emit('notCreated');
    }

    @SubscribeMessage('join')
    joinGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : JoinGameDto
    ) : void {
        const gameOption : GameOptionDto = this.gameService.joinGame(client.id, dto);
        if (gameOption) {
            client.join(dto.gameId);
            this.server.to(dto.gameId).emit("started", gameOption);
        }
        else
            client.emit("notStarted");
    }

    @SubscribeMessage('watch')
    async viewGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() gameId : string
    ) : Promise<void> {
        const status = await this.gameService.viewGame(client.id, gameId);
        if (status) {
            const gameData = this.gameService.getGameData(gameId);
            client.join(gameId);
            client.emit("viewerJoined", gameData);
        }
        else
            client.emit("viewerNotJoined")
    }

    @SubscribeMessage('init')
    initialData(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameDataDto
    ) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            this.gameService.setGameData(clientRoom.gameId, dto)
        }
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
                dto.leftPaddle.dy = -dto.paddleSpeed;
            else
                dto.rightPaddle.dy = -dto.paddleSpeed;
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
        if(!dto)
            return
        const gameId = this.gameService.getPlayerGameId(client.id);
        if (gameId) {
            const isEnded = this.gameService.endOfGame(client.id, dto, gameId);
            if (isEnded) {
                this.server.to(gameId).emit('finished');
            }
            client.leave(gameId);
        }
        this.gameService.deleteViewer(client.id);
    }

    @SubscribeMessage('leave')
    leaveGame(@ConnectedSocket() client: Socket) : void {
        const playerGameId = this.gameService.getPlayerGameId(client.id)
        if (playerGameId) {
            this.server.to(playerGameId).emit('finished');
            this.gameService.deletePlayer(client.id);
            this.gameService.deleteGameOption(playerGameId);
        }
        const viewerGameId = this.gameService.getViewerGameId(client.id);
        if (viewerGameId) {
            this.gameService.deleteViewer(client.id);
            client.leave(viewerGameId);
        }
    }
}