import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "./game.entity";
import {UserService} from "../users/user.service";
import {GameDataDto} from "./dto/game-data.dto";

var firstPlayer : string = "";
var secondPlayer : string = "";
var recievedDto : GameDataDto = null;

@Injectable()
export class GameService {
    constructor(@InjectRepository(Game) private gameRepository : Repository<Game>,
                private readonly userService : UserService) {}


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