import {Module} from "@nestjs/common";
import {UsersService} from "./users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersController} from "./users.controller";
import {User} from "./users.entity";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        TypeOrmModule.forFeature([User])
    ],
    // exports: [UsersService]
})

export class UsersModule {}