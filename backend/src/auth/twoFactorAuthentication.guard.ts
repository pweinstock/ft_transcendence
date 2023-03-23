import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export default class TwoFactorAuthenticationGuard extends AuthGuard('2FA') {}