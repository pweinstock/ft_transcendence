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

    private gameIdToMatchData = new Map<number, MatchData>();
    private playerToGameId = new Map<string, number>();
    private viewerToGameId = new Map<string, number>();

    async joinGame (clientId : string, dto : JoinGameDto) : Promise<string> {
        const game = await this.findGamebyId(dto.gameId);
        if (game.finished)
            throw new HttpException('Game is finished!', HttpStatus.BAD_REQUEST);
        if (this.gameIdToMatchData.has(game.id)) {
            return this.checkPlayerStatus(clientId, dto);
        }
        this.deletePlayer(clientId);
        this.playerToGameId.set(clientId, game.id);
        this.gameIdToMatchData.set(game.id, { firstPlayer : dto.displayName, secondPlayer : null, isStarted: false }); //todo check if null works or should be empty string
        return "firstPlayer";
    }

    isStarted(gameId : number) : boolean {
        if (this.gameIdToMatchData.has(gameId))
            return this.gameIdToMatchData.get(gameId).isStarted;
        return false;
    }

    endOfGame(clientId : string, dto : GameScoreDto) : boolean {
        if (!this.playerToGameId.has(clientId) || this.playerToGameId.get(clientId) !== dto.gameId)
            return false;
        this.deletePlayer(clientId);
        if (!this.gameIdToMatchData.has(dto.gameId))
            return false;
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
        const gameData = this.gameRepository.findOneBy({id : gameId});
        if (!gameData)
            throw new HttpException('game is not exists', HttpStatus.BAD_REQUEST);
        return gameData;
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
        if (this.gameIdToMatchData.has(gameId)) {
            this.gameIdToMatchData.delete(gameId);
            this.gameRepository.delete(gameId);
        }
    }

    //Helpers
    checkPlayerStatus (clientId : string, dto : JoinGameDto) : string {
        let match = this.gameIdToMatchData.get(dto.gameId);
        if (match.secondPlayer === dto.displayName || match.firstPlayer === dto.displayName)
            return "reconnected";
        if (match.secondPlayer) {
            this.viewerToGameId.set(clientId, dto.gameId);
            return "viewer";
        }
        match.secondPlayer = dto.displayName;
        match.isStarted = true;
        this.gameIdToMatchData.set(dto.gameId, match);
        this.deletePlayer(clientId);
        this.playerToGameId.set(clientId, dto.gameId);
        return "secondPlayer";
    }

    deletePlayer(clientId : string) : void {
        if (this.playerToGameId.has(clientId))
            this.playerToGameId.delete(clientId);
    }

    deleteViewer(clientId : string) : void {
        if (this.viewerToGameId.has(clientId))
            this.viewerToGameId.delete(clientId);
    }

    isPlayer(clientId : string) : boolean {
        if (this.playerToGameId.has(clientId))
            return true;
        return false;
    }

    getGameId(clientId : string) : number {
        return this.playerToGameId.get(clientId);
    }
}