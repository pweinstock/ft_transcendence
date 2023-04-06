import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "./game.entity";
import {createGameDto} from "./dto/create-game.dto";
import {JoinGameDto} from "./dto/join-game.dto";
import {GameScoreDto} from "./dto/game-score.dto";

interface MatchData {
    firstPlayer : string,
    secondPlayer : string,
    isStarted : boolean
}

@Injectable()
export class GameService {
    constructor(@InjectRepository(Game) private gameRepository : Repository<Game>) {}

    private matchData = new Map<number, MatchData>();
    private clientToGame = new Map<string, number>();

    async joinGame (clientId : string, dto : JoinGameDto) : Promise<string> {
        const game = await this.findGamebyId(dto.gameId);
        if (game.finished)
            throw new HttpException('Game is finished!', HttpStatus.BAD_REQUEST);
        if (this.matchData.has(game.id)) {
            return this.checkPlayerStatus(clientId, dto);
        }
        this.deletePlayer(clientId);
        this.clientToGame.set(clientId, game.id);
        this.matchData.set(game.id, { firstPlayer : dto.displayName, secondPlayer : null, isStarted: false }); //todo check if null works or should be empty string
        return "firstPlayer";
    }

    isStarted(gameId : number) : boolean {
        return this.matchData.get(gameId).isStarted
    }

    endOfGame(clientId : string, dto : GameScoreDto) : boolean {
        if (!this.clientToGame.has(clientId) || !this.matchData.has(dto.gameId))
            return false;
        if (this.clientToGame.get(clientId) !== dto.gameId)
            return false;
        this.deletePlayer(clientId);
        this.deleteGame(dto.gameId);
        this.finalScore(dto);
        return true;
    }

    //WORKING WITH DATABASE
    async findAllGame() : Promise<Game[]> {
        const games = this.gameRepository.find();
        return games;
    }

    async findGamebyId(gameId : number) : Promise<Game> {
        const game = this.gameRepository.findOneBy({id : gameId});
        if (!game)
            throw new HttpException('game is not exists', HttpStatus.BAD_REQUEST);
        return game;
    }

    async createGame(dto : createGameDto) : Promise<Game> {
        if (!dto || !dto.firstPlayer || !dto.secondPlayer || dto.firstPlayer === '' || dto.secondPlayer === '')
            throw new HttpException('Player names are Empty', HttpStatus.BAD_REQUEST)
        const game = await this.gameRepository.save(dto);
        return game;
    }

    async finalScore(dto : GameScoreDto) {
        const game = await this.findGamebyId(dto.gameId);
        game.firstPlayerScore = dto.firstPlayerScore;
        game.secondPlayerScore = dto.secondPlayerScore;
        game.finished = true;
        this.gameRepository.save(game);
    }

    deleteGame(gameId : number) : void {
        this.matchData.delete(gameId);
        this.gameRepository.delete(gameId);
    }

    //Helpers
    checkPlayerStatus (clientId : string, dto : JoinGameDto) : string {
        let match = this.matchData.get(dto.gameId);
        if (match.secondPlayer === dto.displayName || match.firstPlayer === dto.displayName)
            return "reconnected";
        if (match.secondPlayer)
            return "viewer";
        match.secondPlayer = dto.displayName;
        match.isStarted = true;
        this.matchData.set(dto.gameId, match);
        this.deletePlayer(clientId);
        this.clientToGame.set(clientId, dto.gameId);
        return "secondPlayer";
    }

    deletePlayer(clientId : string) : void {
        if (this.clientToGame.has(clientId))
            this.clientToGame.delete(clientId);
    }

    isPlayer(clientId : string) : boolean {
        if (this.clientToGame.has(clientId))
            return true;
        return false;
    }

    getGameId(clientId : string) : number {
        return this.clientToGame.get(clientId);
    }

    getMatchData(gameId : number) : MatchData {
        return this.matchData.get(gameId);
    }

    deletePlayerData(gameId : number) : void {
        this.matchData.delete(gameId);
    }
}