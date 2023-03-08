import {Module} from "@nestjs/common";
import {UserService} from "./user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./user.controller";
import {User} from "./user.entity";
import { Chat } from "src/chat/chat.entity";
import { ChatModule } from "src/chat/chat.module";
import { Message } from "src/chat/message/message.entity";

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        TypeOrmModule.forFeature([User, Chat, Message]),
        ChatModule,
    ],
    exports: [UserService]
})

export class UserModule {}