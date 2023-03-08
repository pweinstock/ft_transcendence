import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import { User } from 'src/users/user.entity';
import { Chat } from '../chat.entity';
import { Message } from './message.entity';

@Module({
    controllers: [],
    providers: [],
    imports: [
        TypeOrmModule.forFeature([Chat, User, Message])
    ],
    exports: []
})
export class MessageModule {}
