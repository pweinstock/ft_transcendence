import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage, MessageBody, ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {GameService} from "./game.service";
import {HttpException, HttpStatus, Req, UseGuards} from "@nestjs/common";
import {AuthGuard} from '@nestjs/passport';



@WebSocketGateway(Number(process.env.GAME_PORT) | 5002, {
    namespace: "game",
    transports: ["websocket"],
    cors: {	origin: '*' },
})

export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server : Server;

    constructor(private readonly gameService: GameService) {}

    // @SubscribeMessage('gameUpdate')
    // gameUpdate(@MessageBody() dto: GameDataDto,
    //            @ConnectedSocket() client: Socket) {
    //     // client.broadcast.emit('gameUpdate', dto);
    //     const gameId = this.gameService.getGame(client.id);
    //     if (gameId)
    //         this.server.to(String(gameId)).emit('gameUpdate', dto);
    //     else
    //         console.log('game not registered under this player!');
    // }

    afterInit(server: Server) {}

    @UseGuards(AuthGuard('2FA'))
    handleConnection() {}

    handleDisconnect(@ConnectedSocket() client: Socket) {}

    @SubscribeMessage('newGame')
    @UseGuards(AuthGuard('2FA'))
    handleNewGame(
        @Req() request: any,
        @ConnectedSocket() client: Socket,
        @MessageBody() gameId : number
    ) : void {
        if (!request)
            throw new HttpException('Request is not recieved!', HttpStatus.BAD_REQUEST);
        this.gameService.newGame(request.user, gameId);
        client.join(String(gameId));
        this.server.to(String(gameId)).emit('gameCreated', gameId);
    }

    @SubscribeMessage('joinGame')
    @UseGuards(AuthGuard('2FA'))
    handleJoinGame(
        @Req() request: any,
        @ConnectedSocket() client: Socket,
        @MessageBody() gameId : number
    ) : void {
        if (!request)
            throw new HttpException('Request is not recieved!', HttpStatus.BAD_REQUEST);
        this.gameService.addSecondPlayer(request.user, gameId);
        client.join(String(gameId));
        this.server.to(String(gameId)).emit('startGame', gameId);
    }

    @SubscribeMessage('watchGame')
    @UseGuards(AuthGuard('2FA'))
    handleWatchGame (
        @Req() request: any,
        @ConnectedSocket() client: Socket,
        @MessageBody() gameId : number
    ) : void {
        if (!request)
            throw new HttpException('Request is not recieved!', HttpStatus.BAD_REQUEST);
        // this.gameService.userJoined(request.user, client.id);
        client.join(String(gameId));
        this.server.to(String(gameId)).emit('userJoined', request.user.displayName);
    }


    // @SubscribeMessage('finishGame')
    // @UseGuards(AuthGuard('2FA'))
    // handlefinishGame(
    //     @Req() request: any,
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() dto : createGameDto
    // ) : void {
    //     if (!request)
    //         throw new HttpException('Request is not recieved!', HttpStatus.BAD_REQUEST);
    //     this.server.to(String(gameId)).emit('', request.user.displayName);
    // }


    // @SubscribeMessage('leaveGame')
    // @UseGuards(AuthGuard('2FA'))
    // handleLeaveGame(@Req() request: any,
    //                 @ConnectedSocket() client: Socket,
    //                 @MessageBody() gameId : string
    // ) : void {
    //     if (!request)
    //         throw new HttpException('Request is not recieved!', HttpStatus.BAD_REQUEST);
    //     client.leave(String(gameId));
    //     this.server.to(String(gameId)).emit('userLeft', request.user.displayName);
    //     // this.gameService.gamefinished(); // todo implement function!
    // }

    // @SubscribeMessage('scorePoint')
    // handleScorePoint(client: any) {
    //     console.log(`Player ${client.id} scored a point`);
    //     this.players.forEach((player, index) => {
    //         if (player.id !== client.id) {
    //             player.emit('opponentScored', 'Your opponent scored a point!');
    //         } else {
    //             player.emit('youScored', 'You scored a point!');
    //         }
    //     });
    // }

}