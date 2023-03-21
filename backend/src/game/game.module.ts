import { Module } from "@nestjs/common";
import {GameGateway} from "./game.gateway";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Game} from "./game.entity";
import {GameService} from "./game.service";
import {UserService} from "../users/user.service";

@Module({
    controllers: [GameGateway],
    providers: [GameService],
    imports: [
        TypeOrmModule.forFeature([Game]),
        UserService,
    ],
})
export class GameModule {}
