import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { Chat } from './chat.entity';
import { User } from 'src/users/users.entity';
import { UserChats } from './user-chats.entity';

@Module({
    controllers: [ChatController],
    providers: [ChatService],
    imports: [
        TypeOrmModule.forFeature([Chat, User, UserChats])
    ],
    exports: [ChatService]
})
export class ChatModule {}
