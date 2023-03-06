import {Module} from "@nestjs/common";
import { UsersModule } from './users/users.module';
import {User} from "./users/users.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { Chat } from "./chat/chat.entity";
import { UserChats } from "./chat/user-chats.entity";
import {AuthModule} from "../dist/auth/auth.module";



@Module({
    controllers: [],
    providers: [],
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [User, Chat, UserChats],
            synchronize: true,
        }),
        UsersModule,
        ChatModule,
        AuthModule,
    ],
})

export class AppModule {}