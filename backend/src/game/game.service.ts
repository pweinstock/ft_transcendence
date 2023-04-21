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

    private playerToGameId = new Map<string, ClientRoom>();
    private viewerToGameId = new Map<string, string>();
    private gameIdToGameOption = new Map<string, GameOptionDto>();
    private gameIdtoGameData = new Map<string, GameDataDto>();

    async newGame (clientId : string, dto : GameOptionDto ) : Promise<string> {
        const gameId = this.getPlayerGameId(clientId);
        if (gameId)
            return null;
        // const game = await this.gameRepository.save({firstPlayer : dto.firstPlayer, secondPlayer : null});
        this.playerToGameId.set(clientId, {gameId : dto.firstPlayer, isFirst : true});
        this.gameIdToGameOption.set(gameId, dto);
        return gameId;
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

    joinGame (clientId : string, dto : JoinGameDto) : GameOptionDto {
        const gameOption : GameOptionDto = this.gameIdToGameOption.get(dto.gameId);
        if (!gameOption || gameOption.isStarted) {
            return null;
        }
        gameOption.secondPlayer = dto.displayName;
        gameOption.isStarted = true;
        this.gameIdToGameOption.set(dto.gameId, gameOption);
        this.userService.changeStatus(gameOption.firstPlayer, dto.gameId);
        this.userService.changeStatus(dto.displayName, dto.gameId);
        this.playerToGameId.set(clientId, {gameId : dto.gameId, isFirst : false});
        return gameOption;
    }

    async viewGame (clientId : string, gameId : string) : Promise<boolean> {
        const gameData = await this.findGamebyId(gameId);
        if (!gameData)
            return false;
        this.viewerToGameId.set(clientId, gameId);
        return true;
    }

    isStarted(gameId : string) : boolean {
        if (this.gameIdToGameOption.has(gameId))
            return this.gameIdToGameOption.get(gameId).isStarted;
        return false;
    }

    async getFinishedGames() : Promise<Game[] | null> {
        const games : Game[] = [];
        const allGames = await this.gameRepository.find();
        allGames.forEach((game) => {
            if (game.finished)
                games.push(game);
        })
        return games;
    }

    getGamesToWatch() : GameInfoDto[] {
        const gameIds: GameInfoDto[] = [];
        for (const [gameId, matchData] of this.gameIdToGameOption.entries()) {
            if (matchData.isStarted) {
                gameIds.push({firstPlayer : matchData.firstPlayer, secondPlayer : matchData.secondPlayer, gameId : gameId});
            }
        }
        return gameIds;
    }

    getGamesToJoin() : GameInfoDto[] {
        const games: GameInfoDto[] = [];
        for (const [gameId, matchData] of this.gameIdToGameOption.entries()) {
            if (!matchData.isStarted) {
                games.push({firstPlayer : matchData.firstPlayer, secondPlayer : matchData.secondPlayer, gameId : gameId});
            }
        }
        return games;
    }

    async endOfGame(clientId : string, dto : GameScoreDto, gameId : string) : Promise<boolean> {
        this.deletePlayer(clientId);
        if (!this.gameIdToGameOption.has(gameId))
            return false;
        await this.finalScore(dto, gameId);
        this.sendScoreToUser(dto, gameId);
        this.deleteGameOption(gameId);
        this.deleteGameData(gameId);
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

    async finalScore(dto : GameScoreDto, gameId : string) {
        const game : Game = await this.findGamebyId(gameId);
        if (game) {
            game.firstPlayerScore = dto.firstPlayerScore;
            game.secondPlayerScore = dto.secondPlayerScore;
            this.userService.changeStatus(game.firstPlayer, "online");
            this.userService.changeStatus(game.secondPlayer, "online");
            game.finished = true;
            if (game.firstPlayerScore > game.secondPlayer)
                game.winner = game.firstPlayer;
            else if (game.firstPlayerScore < game.secondPlayer)
                game.winner = game.secondPlayer;
            await this.gameRepository.save(game);
        }
    }

    deleteGameOption(gameId : string) : void {
        this.gameIdToGameOption.delete(gameId);
    }

    //Helpers
    deletePlayer(clientId : string) : void {
        this.playerToGameId.delete(clientId);
    }

    getViewerGameId (clientId : string) : string {
        return this.viewerToGameId.get(clientId);
    }

    deleteViewer(clientId : string) : void {
        this.viewerToGameId.delete(clientId);
    }

    isPlayer(clientId : string) : boolean {
        if (this.playerToGameId.has(clientId))
            return true;
        return false;
    }

    getPlayerGameId(clientId : string) : string {
        const gameId = this.playerToGameId.get(clientId);
        if (gameId)
            return gameId.gameId;
        return null;
    }

    getClientRoom(clientId : string) : ClientRoom {
        return this.playerToGameId.get(clientId);
    }

    sendScoreToUser(dto : GameScoreDto, gameId : string) : void {
        const matchData = this.gameIdToGameOption.get(gameId);
        if (matchData) {
            if (dto.firstPlayerScore > dto.secondPlayerScore) {
                this.userService.wonGame(matchData.firstPlayer, gameId);
                this.userService.lostGame(matchData.secondPlayer, gameId);
            }
            else if (dto.firstPlayerScore < dto.secondPlayerScore) {
                this.userService.lostGame(matchData.firstPlayer, gameId);
                this.userService.wonGame(matchData.secondPlayer, gameId);
            }
            else {
                this.userService.draw(matchData.firstPlayer, gameId);
                this.userService.draw(matchData.secondPlayer, gameId);
            }
            this.deleteGameData(gameId);
        }
    }
}