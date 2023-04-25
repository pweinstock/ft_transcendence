import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {GameService} from "./game.service";
import {Game} from "./game.entity";
import {GameInfoDto} from "./dto/game-info.dto";


@Controller('game')
export class GameController {

    constructor(private gameService: GameService) {}

    @Get()
    @UseGuards(AuthGuard('2FA'))
    async getFinishedGames() : Promise<Game[]> {
        return await this.gameService.getFinishedGames();
    }

    @Get('all')
	@UseGuards(AuthGuard('2FA'))
    async getAll() : Promise<Game[]> {
        return this.gameService.findAllGame();
    }

    @Get('id/:id')
    @UseGuards(AuthGuard('2FA'))
    async getById(@Param('id') id : string) : Promise<Game> {
        return this.gameService.findGameById(id);
    }

    @Get('watch')
    @UseGuards(AuthGuard('2FA'))
    gamesToWatch() : GameInfoDto[] {
        return this.gameService.getGamesToWatch();
    }

    @Get('join')
    @UseGuards(AuthGuard('2FA'))
    gamesToJoin() : GameInfoDto[] {
        return this.gameService.getGamesToJoin();
    }
}