import {Module} from "@nestjs/common";
import { UsersModule } from './users/users.module';
import {User} from "./users/users.entity";
import { AuthController } from './auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';



@Module({
    controllers: [AuthController],
    providers: [],
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
        // AuthModule,
    ],
})

export class AppModule {}