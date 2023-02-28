import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-42";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: process.env.FORTYTWO_APP_ID,
            clientSecret: process.env.FORTYTWO_APP_SECRET,
            callbackURL: process.env.FORTYTWO_CALLBACK_URL
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {

        // if (!user) {
        //     throw new UnauthorizedException();
        //   }
        // return user;        
        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile);
        this.auth
    }
}