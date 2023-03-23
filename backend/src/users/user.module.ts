import {forwardRef, Module} from "@nestjs/common";
import {UserService} from "./user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./user.controller";
import {User} from "./user.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        TypeOrmModule.forFeature([User]),
		forwardRef(() => AuthModule),
    ],
    exports: [UserService]
})

export class UserModule {}