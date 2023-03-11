import {Module} from "@nestjs/common";
import { UserModule } from './users/user.module';
import {User} from "./users/user.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { Chat } from "./chat/chat.entity";
import { AuthModule } from "./auth/auth.module";
import { AppGateway } from './app/app.gateway';
import { Message } from "./chat/message/message.entity";
import { MessageModule } from "./chat/message/message.module";

@Module({
    controllers: [],
    providers: [AppGateway],
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [User, Chat, Message],
            synchronize: true,
        }),
        UserModule,
        ChatModule,
        // AuthModule,
        MessageModule
    ],
})

export class AppModule {}