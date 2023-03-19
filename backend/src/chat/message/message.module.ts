import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import { Message } from './message.entity';
import {MessageService} from "./message.service";

@Module({
    controllers: [],
    providers: [MessageService],
    imports: [
        TypeOrmModule.forFeature([Message])
    ],
    exports: [MessageService]
})
export class MessageModule {}
