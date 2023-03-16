import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { Chat } from './chat.entity';
import { User } from 'src/users/entity/user.entity';
import { Message } from './message/message.entity';
import {UserModule} from "../users/user.module";
import {MessageModule} from "./message/message.module";
import {ChatGateway} from "./chat.gateway";

@Module({
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    imports: [
        TypeOrmModule.forFeature([Chat, User, Message]),
        UserModule,
        MessageModule,
    ],
})
export class ChatModule {}
