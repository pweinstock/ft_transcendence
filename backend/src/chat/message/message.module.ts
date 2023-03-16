import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import { User } from 'src/users/entity/user.entity';
import { Chat } from '../chat.entity';
import { Message } from './message.entity';
import {MessageService} from "./message.service";

@Module({
    controllers: [],
    providers: [MessageService],
    imports: [
        TypeOrmModule.forFeature([Chat, User, Message])
    ],
    exports: [MessageService]
})
export class MessageModule {}
