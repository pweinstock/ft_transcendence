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
import {GameDataDto} from "./dto/game-data.dto";


@WebSocketGateway(Number(process.env.GAME_PORT) | 5002, {
    namespace: "game",
    transports: ["websocket"],
    cors: {	origin: '*' },
})

export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly gameService : GameService) {}

    // @SubscribeMessage("join")
    // joinGame(
        // @MessageBody("join") data : number,
    //     @ConnectedSocket() client : Socket
    // ) {
    //     console.log('game connected')
        // console.log(data);
        // this.gameService.identify(client.id);
        // this.server.emit('join', client.id);
        // return client.id;
    // }

    // @SubscribeMessage('movePaddle')
    // handleMovePaddle(@MessageBody('game') dto : GameDataDto,
    //                  @ConnectedSocket() client : Socket) {
    //     client.broadcast.emit('gameDataUpdate', dto);
    // }
    //
    // @SubscribeMessage('changePosition')
    // changePosition(@MessageBody('game') dto : GameDataDto,
    //                  @ConnectedSocket() client : Socket) {
    //     if (this.gameService.isFirstPlayer(client.id) || this.gameService.isSecondPlayer(client.id)) {
    //         this.gameService.validate(dto);
    //         client.broadcast.emit('changePosition', dto);
    //         console.log(dto);
    //     }
    // }

    // @SubscribeMessage("connect")
    // joinGame(
    //     @ConnectedSocket() client : Socket
    // ) {
    //     console.log('game connected')
    //     return client.id;
    // }

    @SubscribeMessage('gameUpdate')
    gameUpdate(@MessageBody() dto : GameDataDto,
               @ConnectedSocket() client : Socket) {
        console.log(client);
        client.broadcast.emit('gameUpdate', dto);
    }

    afterInit(server: Server) {
        console.log('Port initialized');
    }

    handleConnection(@MessageBody() dto : GameDataDto,
                     @ConnectedSocket() client : Socket) {
        console.log(`Player connected`);
        // this.players.push(client);
        // client.emit('connectSuccess', `Connected to Pong game as Player ${this.players.length}`);
    }

    handleDisconnect(client: any) {
        console.log(`Player disconnected`);

        // console.log(`Player ${client.id} disconnected`);
        // this.players.splice(this.players.indexOf(client), 1);
        // this.players.forEach((player, index) => {
        //     player.emit('playerLeft', `Player ${client.id} left the game`);
        // });
    }



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
