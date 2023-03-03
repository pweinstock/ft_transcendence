import {Module} from "@nestjs/common";
import {UsersService} from "./users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersController} from "./users.controller";
import {User} from "./users.entity";
import { Chat } from "src/chat/chat.entity";
import { UserChats } from "src/chat/user-chats.entity";
import { ChatModule } from "src/chat/chat.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        TypeOrmModule.forFeature([User, Chat, UserChats]),
        ChatModule,
    ],
    exports: [UsersService]
})

export class UsersModule {}