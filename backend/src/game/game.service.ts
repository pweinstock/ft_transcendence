import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserService} from "../users/user.service";

@Injectable()
export class GameService {
    constructor(private userServices: UserService) {}

    //USER INTERRACTION

}