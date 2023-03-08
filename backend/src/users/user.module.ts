import {Module} from "@nestjs/common";
import {UsersService} from "./user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersController} from "./user.controller";
import {User} from "./user.entity";
import { Chat } from "src/chat/chat.entity";
import { ChatModule } from "src/chat/chat.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        TypeOrmModule.forFeature([User, Chat]),
        ChatModule,
    ],
    exports: [UsersService]
})

export class UsersModule {}