import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "./game.entity";
import {UserService} from "../users/user.service";
import {User} from "../users/user.entity";
import {createGameDto} from "./dto/create-game.dto";

export interface MatchData {
    firstPlayer : User,
    secondPlayer : User,
}

@Injectable()
export class GameService {
    constructor(@InjectRepository(Game) private gameRepository : Repository<Game>,
                private readonly userService : UserService) {}

    private matchData = new Map<number, MatchData>();
    private clientToPlayers = new Map<string, User>();
    //
    // joinUser(user : User, clientId : string) : void {
    //     if (!this.clientToUser.has(clientId))
    //         this.clientToUser.set(clientId, user);
    // }
    //
    // disconnectUser(clientId : string) : void {
    //     if (this.clientToUser.has(clientId))
    //         this.clientToUser.delete(clientId);
    // }
    //
    // getClient(clientId : string) : User {
    //     return this.clientToUser.get(clientId);
    // }

    newGame (user : User, gameID : number) : void {
        if (this.matchData.has(gameID))
            throw new HttpException('Cant create game with this ID', HttpStatus.BAD_REQUEST);
        this.matchData.set(gameID, { firstPlayer : user, secondPlayer : null });
    }

    addSecondPlayer (user : User, gameId : number) : void {
        if (!this.matchData.has(gameId))
            throw new HttpException('Game is not found!', HttpStatus.BAD_REQUEST);
        const data = this.getMatchData(gameId);
        if (data.firstPlayer === user || data.secondPlayer)
            throw new HttpException('Can not join this game!', HttpStatus.BAD_REQUEST);
        data.secondPlayer = user;
        this.matchData.set(gameId, data);
    }

    getMatchData(gameId : number) : MatchData {
        return this.matchData.get(gameId);
    }

    deletePlayerData(gameId : number) : void {
        this.matchData.delete(gameId);
    }


    //WORKING WITH DATABASE
    async createGame(dto : createGameDto) : Promise<Game> {
        if (!dto || !dto.firstPlayer || !dto.secondPlayer || dto.firstPlayer === '' || dto.secondPlayer === '')
            throw new HttpException('Player names are Empty', HttpStatus.BAD_REQUEST)
        const game = await this.gameRepository.save(dto);
        return game;
    }

    endOfGame(game : Game, firstPlayerScore : number, secondPlayerScore : number) {
        game.firstPlayerScore = firstPlayerScore;
        game.secondPlayerScore = secondPlayerScore;
        this.gameRepository.save(game);
        // if ()
        // this.userService.wonGame( game.id)
    }

    // async gameEnd(dto : GameDataDto) : Promise<void> {
    //     const game = await this.gameRepository.create(dto);
    //     this.gameRepository.save(game);
    // }
    //
    // async identify(clientId : string) : Promise<void> {
    //     if (firstPlayer)
    //         firstPlayer = clientId;
    //     else
    //         secondPlayer = clientId;
    // }
    //
    // isFirstPlayer(player : string) : boolean{
    //     if (player === firstPlayer)
    //         return true;
    //     return false;
    // }
    //
    // isSecondPlayer(player : string) : boolean{
    //     if (player === secondPlayer)
    //         return true;
    //     return false;
    // }
    //
    //
    // // validate(dto : GameDataDto) {
    // //     if (recievedDto) {
    // //         dto.ballX = recievedDto.ballX * (dto.timer - recievedDto.timer) * recievedDto.ballSpeed;
    // //         dto.ballY = recievedDto.ballY * (dto.timer - recievedDto.timer) * recievedDto.ballSpeed;
    // //     }
    // //     else
    // //         recievedDto = dto;
    // //     return dto;
    // // }
}