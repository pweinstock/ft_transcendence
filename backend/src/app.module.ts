import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import { SequelizeModule } from '@nestjs/sequelize';



//TODO change to ENV

@Module({
    controllers: [AppController],
    providers: [AppService],
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'root',
            database: 'transcendence',
            models: [],
            autoLoadModels: true
        }),
    ],
})
export class AppModule {}