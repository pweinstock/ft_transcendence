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


@WebSocketGateway(Number(process.env.SOCKET_PORT), {
    namespace: "game",
    transports: ["websocket"],
    cors: {	origin: '*' },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server : Server;

    constructor(private readonly gameService: GameService) {}

    afterInit() {}

    handleConnection() {}

    handleDisconnect(@ConnectedSocket() client: Socket) {
        if (this.gameService.isPlayer(client.id)) {
            const gameId : string = this.gameService.getPlayerGameId(client.id);
            if (gameId && this.gameService.isStarted(gameId))
            {
                const gameData : GameDataDto = this.gameService.getGameData(gameId);
                gameData.isPaused = true;
                if (gameData)
                    this.server.to(gameId).emit("gameUpdate", gameData);
            }
            else {
                this.gameService.deleteGameOption(gameId);
                this.gameService.deleteGameData(gameId);
            }
        }
        this.gameService.deletePlayer(client.id);
        this.gameService.deleteViewer(client.id);
    }

    @SubscribeMessage('playerDisconnected')
    disconnectGame (@ConnectedSocket() client: Socket) : void {
        if (this.gameService.isPlayer(client.id)) {
            const gameId : string = this.gameService.getPlayerGameId(client.id);
            if (gameId && this.gameService.isStarted(gameId))
            {
                const gameData : GameDataDto = this.gameService.getGameData(gameId);
                gameData.isPaused = true;
                if (gameData) {
                    client.leave(gameId);
                    this.server.to(gameId).emit("gameUpdate", gameData);
                }
            }
            else {
                this.gameService.deletePlayer(client.id);
                this.gameService.deleteGameOption(gameId);
                this.gameService.deleteGameData(gameId);
            }
        }
    }

    @SubscribeMessage('checkInGame')
    checkInGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : JoinGameDto) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            const gameOptions = this.gameService.getGameOptions(clientRoom.gameId);
            if (gameOptions && gameOptions.isStarted)
                client.emit("inGame");
        }
        else {
            const gameId : string = this.gameService.reconnectToGame(client.id, dto.displayName);
            const gameData : GameDataDto = this.gameService.getGameData(gameId);
            if (gameId) {
                client.join(gameId);
                this.server.to(gameId).emit("gameUpdate", gameData);
            }
        }
    }

    @SubscribeMessage('checkCreated')
    checkCreated (@ConnectedSocket() client: Socket) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            const gameOptions = this.gameService.getGameOptions(clientRoom.gameId);
            if (gameOptions && !gameOptions.isStarted)
                client.emit("created");
        }
    }

    @SubscribeMessage('reconnect')
    reconnectGame (@ConnectedSocket() client: Socket) : void {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            const gameData : GameDataDto = this.gameService.getGameData(clientRoom.gameId);
            if (gameData) {
                gameData.isPaused = false;
                client.join(clientRoom.gameId);
                this.server.to(clientRoom.gameId).emit("gameUpdate", gameData);
            }
        }
        else
            client.emit("notReconnected");
    }

    @SubscribeMessage('cancel')
    async cancelGame (@ConnectedSocket() client: Socket) : Promise<void> {
        const clientRoom = this.gameService.getClientRoom(client.id);
        if (clientRoom) {
            const gameOptions = this.gameService.getGameOptions(clientRoom.gameId);
            if (gameOptions && gameOptions.isStarted === false) {
                client.leave(clientRoom.gameId);
                await this.gameService.cancelGame(client.id, clientRoom.gameId);
            }
        }
    }

    @SubscribeMessage('create')
    async createGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() gameOptions : GameOptionDto
    ) : Promise<void> {
        if (!gameOptions || this.gameService.isPlayer(client.id))
            client.emit('notCreated');
        else {
            const gameId = await this.gameService.newGame(client.id, gameOptions);
            if (gameId) {
                client.join(gameId);
                client.emit('created');
                this.server.emit('newPong');
            }
            else
                client.emit('notCreated');
        }
    }

    @SubscribeMessage('join')
    async joinGame (
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : JoinGameDto
    ) : Promise<void> {
        if (!dto)
            client.emit('notStarted');
        else {
            if (this.gameService.isPlayer(client.id)) {
                const clientRoom = this.gameService.getClientRoom(client.id);
                this.gameService.cancelGame(client.id, clientRoom.gameId);
            }
            const gameOption : GameOptionDto = await this.gameService.joinGame(client.id, dto);
            if (gameOption) {
                client.join(dto.gameId);
                this.server.to(dto.gameId).emit("started", gameOption);
            }
            else
                client.emit("notStarted");
        }
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
            this.server.emit('userUpdate');
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
            this.server.to(clientRoom.gameId).emit("gameUpdate", dto);
            this.gameService.setGameData(clientRoom.gameId, dto);
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
            this.server.to(clientRoom.gameId).emit("gameUpdate", dto);
            this.gameService.setGameData(clientRoom.gameId, dto);
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
            this.server.to(clientRoom.gameId).emit("gameUpdate", dto);
            this.gameService.setGameData(clientRoom.gameId, dto);
        }
    }

    @SubscribeMessage('end')
    async gameEnd(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto : GameScoreDto
    ) : Promise<void> {
        const gameId = this.gameService.getPlayerGameId(client.id);
        if (gameId) {
            this.gameService.deletePlayer(client.id);
            const isEnded = await this.gameService.endOfGame(client.id, dto, gameId);
            if (isEnded) {
                this.server.to(gameId).emit('finished');
            }
            client.leave(gameId);
        }
        const viewerGameId = this.gameService.getViewerGameId(client.id);
        if (viewerGameId) {
            this.gameService.deleteViewer(client.id);
            client.leave(viewerGameId);
        }
        this.server.emit('userUpdate');
    }

    @SubscribeMessage('leave')
    leaveGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() player : string
    ) : void {
        const gameId = this.gameService.getPlayerGameId(client.id);
        if (gameId) {
            this.gameService.deletePlayer(client.id);
            this.server.to(gameId).emit('left', player);
            this.gameService.leaveGame(client.id, player, gameId);
            client.leave(gameId);
        }
        const viewerGameId = this.gameService.getViewerGameId(client.id);
        if (viewerGameId) {
            this.gameService.deleteViewer(client.id);
            client.leave(viewerGameId);
        }
        this.server.emit('userUpdate');
    }
}