import {Module} from "@nestjs/common";
import { UsersModule } from './users/users.module';
import {User} from "./users/users.entity";
import { AuthController } from './auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';



@Module({
    controllers: [AuthController, ChatController],
    providers: [ChatService],
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [User],
            synchronize: true,
        }),
        UsersModule,
        RolesModule,
        ChatModule,
        // AuthModule,
    ],
})

export class AppModule {}