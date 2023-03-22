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
import {GameDataDTO} from "./dto/game-data.dto";


const GAME_PORT = Number(process.env.GAME_PORT) || 5002;
@WebSocketGateway(GAME_PORT, {
    namespace: 'game',
    cors: {	origin: '*' },
})

export class GameGateway{// implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly gameService : GameService) {}

    @SubscribeMessage('join')
    joinGame(
        @MessageBody('user') userId : number,
        @ConnectedSocket() client : Socket
    ) {
        return this.gameService.identify(client.id);
    }

    @SubscribeMessage('movePaddle')
    handleMovePaddle(@MessageBody('game') dto : GameDataDTO,
                     @ConnectedSocket() client : Socket) {
        if (this.gameService.isFirstPlayer(client.id))
            client.broadcast.emit('movePaddleLeft', dto);
        else if (this.gameService.isSecondPlayer(client.id))
            client.broadcast.emit('movePaddleRight', dto);
    }

    @SubscribeMessage('changePosition')
    changePosition(@MessageBody('game') dto : GameDataDTO,
                     @ConnectedSocket() client : Socket) {
        if (this.gameService.isFirstPlayer(client.id) || this.gameService.isSecondPlayer(client.id)) {
            this.gameService.validate(dto);
            client.broadcast.emit('changePosition', dto);
            console.log(dto);
        }
    }

    // afterInit(server: Server) {
    //     console.log('Pong game initialized');
    // }
    //
    // handleConnection(client: any, ...args: any[]) {
    //     console.log(`Player ${client.id} connected`);
    //     this.players.push(client);
    //     client.emit('connectSuccess', `Connected to Pong game as Player ${this.players.length}`);
    // }
    //
    // handleDisconnect(client: any) {
    //     console.log(`Player ${client.id} disconnected`);
    //     this.players.splice(this.players.indexOf(client), 1);
    //     this.players.forEach((player, index) => {
    //         player.emit('playerLeft', `Player ${client.id} left the game`);
    //     });
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
