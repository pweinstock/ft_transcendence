import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-42";
import { AuthService } from "./auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.FORTYTWO_APP_ID,
            clientSecret: process.env.FORTYTWO_APP_SECRET,
            callbackURL: process.env.FORTYTWO_CALLBACK_URL
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {    
        console.log(accessToken);
        console.log(refreshToken);
        console.log(Profile);
        const user = await this.authService.validateUser({
            email: profile.emails[0].value,
            id: profile.id,
            displayName: profile.displayName,
            photo: profile.photo
        });
        return user || null;
    }
}