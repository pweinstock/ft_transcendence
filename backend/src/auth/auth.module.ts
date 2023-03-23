import { forwardRef, Module } from "@nestjs/common";
import { UserModule } from "src/users/user.module";
import { HttpModule } from '@nestjs/axios';
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { TwoFactorAuthenticationService } from "./twoFactorAuthentication.service";
import { TwoFactorAuthenticationStrategy } from "./twoFactorAuthentication.strategy";

@Module({
	imports: [
		forwardRef(() => UserModule),
		HttpModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: process.env.JWT_EXPIRES_IN,
			},
		}),
	],
	controllers: [
		AuthController,
	],
	providers: [
		AuthService,
		TwoFactorAuthenticationService,
		AuthStrategy,
		JwtStrategy,
		TwoFactorAuthenticationStrategy,
	],
})
export class AuthModule {}