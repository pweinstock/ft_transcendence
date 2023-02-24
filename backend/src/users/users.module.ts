import {Module} from "@nestjs/common";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {SequelizeMod}


@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        Seque
    ]
})

export class UsersModule {}