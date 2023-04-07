import { Controller, Get, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, Param, Res} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {GameService} from "./game.service";
import {Game} from "./game.entity";
import {createGameDto} from "./dto/create-game.dto";


@Controller('game')
export class UserController {

    constructor(private gameService: GameService) {}

    @Get()
	@UseGuards(AuthGuard('2FA'))
    async getAll() : Promise<Game[]> {
        const games = this.gameService.findAllGame();
        return games;
    }

    @Get('/:id')
    @UseGuards(AuthGuard('2FA'))
    async getGame(@Req() request: any, @Param() gameId : number) : Promise<Game> {
        const game = await this.gameService.findGamebyId(gameId);
        return game;
    }

    @Post()
    @UseGuards(AuthGuard('2FA'))
    async createGame(@Req() request: any, @Body() dto : createGameDto) : Promise<Game>{
        const game = await this.gameService.createGame(dto);
        return game;
    }

    @Post('delete')
    @UseGuards(AuthGuard('2FA'))
    deleteGame(@Req() request: any, @Body() gameId : number) : void {

        this.gameService.deleteGame(request.user.id, gameId);
    }
}
