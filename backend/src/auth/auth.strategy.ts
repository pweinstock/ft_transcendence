import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from 'passport-42'
import { User } from "src/users/user.entity";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, '42') {
	constructor (
		private readonly authService: AuthService
	) {
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: `http://${process.env.HOST_IP}:5000/auth/redirect`,
			scope: ['public']
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
		const user = {
			email: profile['emails'][0]['value'],
			displayName: profile.username,
			photo: profile['photos'][0]['value'],
		}
		return this.authService.validateUser(user);
	}
}