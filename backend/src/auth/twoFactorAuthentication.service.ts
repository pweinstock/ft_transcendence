import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { authenticator } from "otplib";
import { User } from "src/users/user.entity";
import { UserService } from "src/users/user.service";
import { toFileStream } from 'qrcode';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor (
		private readonly userService: UserService
	) {}

	public isTwoFactorAuthenticationCodeValid(twoFactorauthenticationCode: string, user: User) {
		return authenticator.verify({
			token: twoFactorauthenticationCode,
			secret: user.TwoFactorAuthenticationSecret
		})
	}

	public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.email, 'ft_transcendence', secret);
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
		return {secret, otpauthUrl}
	}

	public async deleteTwoFactorAuthenticationSecret(user: User) {
		return this.userService.unsetTwoFactorAuthenticationSecret(user.id);
	}

	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public async enableTwoFactorAuthentication(user: User) {
		return this.userService.enableTwoFactorAuthentication(user.id);
	}

	public async disableTwoFactorAuthentication(user: User) {
		return this.userService.disableTwoFactorAuthentication(user.id);
	}
}