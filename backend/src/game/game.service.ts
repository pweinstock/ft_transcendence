import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "./game.entity";
import {JoinGameDto} from "./dto/join-game.dto";
import {GameScoreDto} from "./dto/game-score.dto";
import {UserService} from "../users/user.service";
import {GameInfoDto} from "./dto/game-info.dto";
import {GameDataDto} from "./dto/game-data.dto";
import {GameOptionDto} from "./dto/game-option.dto";


interface ClientRoom {
    gameId : string;
    isFirst : boolean;
}

@Injectable()
export class GameService {
    constructor(@InjectRepository(Game) private gameRepository : Repository<Game>,
                private userService : UserService) {}

    private gameIdToMatchData = new Map<string, GameOptionDto>();
    private playerToGameId = new Map<string, ClientRoom>();
    private viewerToGameId = new Map<string, string>();
    private gameIdtoGameData = new Map<string, GameDataDto>();

    async newGame (clientId : string, dto : GameOptionDto ) : Promise<string> {
        const gameId = this.getGameId(clientId);
        if (gameId)
            return null;
        const game = await this.gameRepository.save({firstPlayer : dto.firstPlayer, secondPlayer : null});
        this.playerToGameId.set(clientId, {gameId : game.id, isFirst : true});
        this.gameIdToMatchData.set(game.id, dto);
        return game.id;
    }

    getGameData (gameId :string) : GameDataDto {
        return this.gameIdtoGameData.get(gameId);
    }

    setGameData (gameId :string, gameData : GameDataDto) {
        this.gameIdtoGameData.set(gameId, gameData);
    }

    deleteGameData (gameId : string) {
        this.gameIdtoGameData.delete(gameId);
    }

    async joinGame (clientId : string, dto : JoinGameDto) : Promise<string> {
        const game = await this.findGamebyId(dto.gameId);
        if (!game || game.finished)
            return null;
        if (this.gameIdToMatchData.has(game.id)) {
            return this.checkPlayerStatus(clientId, dto);
        }
        this.deletePlayer(clientId);
        this.deleteGameData(game.id);
        this.gameIdToMatchData.delete(game.id);
        this.gameRepository.delete(game.id);
        return null;
    }

    async viewGame (clientId : string, gameId : string) : Promise<boolean> {
        const gameData = await this.findGamebyId(gameId);
        if (!gameData)
            return false;
        this.viewerToGameId.set(clientId, gameId);
        return true;
    }

    isStarted(gameId : string) : boolean {
        if (this.gameIdToMatchData.has(gameId))
            return this.gameIdToMatchData.get(gameId).isStarted;
        return false;
    }

    getGamesToWatch() : GameInfoDto[] {
        const gameIds: GameInfoDto[] = [];
        for (const [gameId, matchData] of this.gameIdToMatchData.entries()) {
            if (matchData.isStarted) {
                gameIds.push({firstPlayer : matchData.firstPlayer, secondPlayer : matchData.secondPlayer, gameId : gameId});
            }
        }
        return gameIds;
    }

    getGamesToJoin() : GameInfoDto[] {
        const games: GameInfoDto[] = [];
        for (const [gameId, matchData] of this.gameIdToMatchData.entries()) {
            if (!matchData.isStarted) {
                games.push({firstPlayer : matchData.firstPlayer, secondPlayer : matchData.secondPlayer, gameId : gameId});
            }
        }
        return games;
    }

    endOfGame(clientId : string, dto : GameScoreDto) : boolean {
        if (!this.playerToGameId.has(clientId) || this.playerToGameId.get(clientId).gameId !== dto.gameId)
            return false;
        this.deletePlayer(clientId);
        if (!this.gameIdToMatchData.has(dto.gameId))
            return false;
        this.deleteGame(dto.gameId);
        this.finalScore(dto);
        this.sendScoreToUser(dto);
        return true;
    }

    //WORKING WITH DATABASE
    async findAllGame() : Promise<Game[]> {
        const games = await this.gameRepository.find();
        return games;
    }

    async findGamebyId(gameId : string) : Promise<Game> {
        const gameData = await this.gameRepository.findOneBy({id : gameId});
        return gameData;
    }

    async finalScore(dto : GameScoreDto) {
        const game : Game = await this.findGamebyId(dto.gameId);
        game.firstPlayerScore = dto.firstPlayerScore;
        game.secondPlayerScore = dto.secondPlayerScore;
        game.finished = true;
        this.gameRepository.save(game);
    }

    deleteGame(gameId : string) : void {
        if (this.gameIdToMatchData.has(gameId)) {
            this.gameIdToMatchData.delete(gameId);
            this.gameRepository.delete(gameId);
        }
    }

    //Helpers
    checkPlayerStatus (clientId : string, dto : JoinGameDto) : string {
        let match : GameOptionDto = this.gameIdToMatchData.get(dto.gameId);
        if (match.secondPlayer === dto.displayName || match.firstPlayer === dto.displayName)
            return dto.gameId;
        if (match.secondPlayer)
            return null;
        match.secondPlayer = dto.displayName;
        match.isStarted = true;
        this.gameIdToMatchData.set(dto.gameId, match);
        this.deletePlayer(clientId);
        this.playerToGameId.set(clientId, {gameId : dto.gameId, isFirst : false});
        return dto.gameId;
    }

    deletePlayer(clientId : string) : void {
        this.playerToGameId.delete(clientId);
    }

    deleteViewer(clientId : string) : void {
        this.viewerToGameId.delete(clientId);
    }

    isPlayer(clientId : string) : boolean {
        if (this.playerToGameId.has(clientId))
            return true;
        return false;
    }

    getGameId(clientId : string) : string {
        const gameId = this.playerToGameId.get(clientId);
        if (gameId)
            return gameId.gameId;
        return null;
    }

    getClientRoom(clientId : string) : ClientRoom {
        return this.playerToGameId.get(clientId);
    }

    sendScoreToUser(dto : GameScoreDto) : void {
        const matchData = this.gameIdToMatchData.get(dto.gameId);
        if (dto.firstPlayerScore > dto.secondPlayerScore) {
            this.userService.wonGame(matchData.firstPlayer, dto.gameId);
            this.userService.lostGame(matchData.secondPlayer, dto.gameId);
        }
        else if (dto.firstPlayerScore < dto.secondPlayerScore) {
            this.userService.lostGame(matchData.firstPlayer, dto.gameId);
            this.userService.wonGame(matchData.secondPlayer, dto.gameId);
        }
        else {
            this.userService.draw(matchData.firstPlayer, dto.gameId);
            this.userService.draw(matchData.secondPlayer, dto.gameId);
        }
    }
}