import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/user.entity";
import { UserService } from "src/users/user.service";

@Injectable()
export class TwoFactorAuthenticationStrategy extends PassportStrategy(Strategy, '2FA') {
	constructor(
		private readonly userService: UserService
	) {
		super({
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					let accessToken = request?.cookies["jwt"];
					return accessToken;
				}
			]),
		});
	}

	async validate(payload: any): Promise<User> {
		const email = payload.email;
		const user = await this.userService.findByEmail(email);
		if (!user)
			throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
		else if (!user.isTwoFactorAuthenticationEnabled)
			return user;
		else if (payload.isTwoFactorAuthenticated)
			return user;
		else
			throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
	}
}