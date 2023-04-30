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
    private gameIdToGameData = new Map<string, GameDataDto>();

    async newGame (clientId : string, dto : GameOptionDto ) : Promise<string> {
        const gameId = this.getPlayerGameId(clientId);
        if (gameId)
            return null;
        const user = await this.userService.findByName(dto.firstPlayer);
        if (!user)
            return null;
        const game = await this.gameRepository.save({firstPlayer : user.id, secondPlayer : null});
        this.playerToGameId.set(clientId, {gameId : game.id, isFirst : true});
        this.gameIdToGameOption.set(game.id, dto);
        return game.id;
    }

    reconnectToGame (clientId : string, playerName : string) : string {
        for (const [gameId, gameData] of this.gameIdToGameData) {
            if (gameData.players.firstPlayer === playerName) {
                this.playerToGameId.set(clientId, {gameId: gameId, isFirst: true});
                return gameId;
            }
            else if (gameData.players.secondPlayer === playerName) {
                this.playerToGameId.set(clientId, {gameId: gameId, isFirst: false});
                return gameId;
            }
        }
        return null;

    }

    getGameData (gameId :string) : GameDataDto {
        return this.gameIdToGameData.get(gameId);
    }

    setGameData (gameId :string, gameData : GameDataDto) {
        this.gameIdToGameData.set(gameId, gameData);
    }

    deleteGameData (gameId : string) {
        this.gameIdToGameData.delete(gameId);
    }

    async joinGame (clientId : string, dto : JoinGameDto) : Promise<GameOptionDto> {
        const gameOption : GameOptionDto = this.getGameOptions(dto.gameId);
        if (!gameOption || gameOption.isStarted) {
            return null;
        }
        await this.setSecondPlayer(dto.gameId, dto.displayName);
        gameOption.secondPlayer = dto.displayName;
        gameOption.isStarted = true;
        this.gameIdToGameOption.set(dto.gameId, gameOption);
        this.userService.changeStatus(gameOption.firstPlayer, dto.gameId);
        this.userService.changeStatus(dto.displayName, dto.gameId);
        this.playerToGameId.set(clientId, {gameId : dto.gameId, isFirst : false});
        return gameOption;
    }

    async setSecondPlayer(gameId : string, secondPlayer : string) : Promise<void> {
        const game : Game = await this.findGameById(gameId);
        const user = await this.userService.findByName(secondPlayer);
        if (user)
            game.secondPlayer = user.id;
        await this.gameRepository.save(game);
    }


    async viewGame (clientId : string, gameId : string) : Promise<boolean> {
        const gameData = await this.findGameById(gameId);
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
        if (!this.gameIdToGameOption.has(gameId))
            return false;
        await this.finalScore(dto, gameId);
        this.sendScoreToUser(dto, gameId);
        this.deleteGameOption(gameId);
        this.deleteGameData(gameId);
        return true;
    }

    async leaveGame (clientId : string, playerName : string, gameId : string) : Promise<void> {
        await this.recordTechnicalLoose(gameId, playerName);
        this.deleteGameOption(gameId);
        this.deleteGameData(gameId);
    }

    //WORKING WITH DATABASE
    async findAllGame() : Promise<Game[]> {
        return await this.gameRepository.find();
    }

    async findGameById(gameId : string) : Promise<Game> {
        return await this.gameRepository.findOneBy({id: gameId});
    }

    async finalScore(dto : GameScoreDto, gameId : string) {
        const game : Game = await this.findGameById(gameId);
        if (game) {
            game.firstPlayerScore = dto.firstPlayerScore;
            game.secondPlayerScore = dto.secondPlayerScore;
            this.userService.changeStatus(game.firstPlayer, "online");
            this.userService.changeStatus(game.secondPlayer, "online");
            game.finished = true;
            if (Number(game.firstPlayerScore) > Number(game.secondPlayerScore))
                game.winner = game.firstPlayer;
            else if (Number(game.firstPlayerScore) < Number(game.secondPlayerScore))
                game.winner = game.secondPlayer;
            await this.gameRepository.save(game);
        }
    }


    deleteGameOption(gameId : string) : void {
        this.gameIdToGameOption.delete(gameId);
    }

    //Helpers
    async recordTechnicalLoose (gameId : string, playerName : string) : Promise <boolean> {
        const game : Game = await this.findGameById(gameId);
        if (game && game.finished === false) {
            const matchData = this.gameIdToGameOption.get(gameId);
            this.userService.changeStatus(game.firstPlayer, "online");
            this.userService.changeStatus(game.secondPlayer, "online");
            game.finished = true;
            if (game.firstPlayer === playerName) {
                game.secondPlayerScore = 11;
                game.winner = game.secondPlayer;
                this.userService.lostGame(matchData.firstPlayer, gameId);
                this.userService.wonGame(matchData.secondPlayer, gameId);
            }
            else {
                game.firstPlayerScore = 11;
                game.winner = game.firstPlayer;
                this.userService.lostGame(matchData.secondPlayer, gameId);
                this.userService.wonGame(matchData.firstPlayer, gameId);
            }
            await this.gameRepository.save(game);
            return true;
        }
        return false;
    }

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
        return this.playerToGameId.has(clientId);
    }

    getPlayerGameId(clientId : string) : string {
        const gameId = this.playerToGameId.get(clientId);
        return gameId ? gameId.gameId : null;
    }

    getClientRoom(clientId : string) : ClientRoom {
        return this.playerToGameId.get(clientId);
    }

    getGameOptions(gameId : string) : GameOptionDto {
        return this.gameIdToGameOption.get(gameId);
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

    async cancelGame(clientId : string, gameId : string) : Promise<void> {
        this.deleteGameOption(gameId);
        this.deletePlayer(clientId);
        await this.gameRepository.delete(gameId);
    }
}