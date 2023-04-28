import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { TwoFactorAuthenticationService } from "./twoFactorAuthentication.service";

@Controller('auth')
export class AuthController {
	constructor (
		private jwtService: JwtService,
		private twoFactorAuthenticationService: TwoFactorAuthenticationService,
	) {}

	@Get('login')
	@UseGuards(AuthGuard('42'))
	login() {
	}

	@Get('logout')
	@UseGuards(AuthGuard('2FA'))
	logout(@Res({ passthrough: true}) res: Response) {
		res.clearCookie('jwt', { httpOnly: true});
	}

	@Get('redirect')
	@UseGuards(AuthGuard('42'))
	async redirect(@Res({passthrough: true}) res: Response, @Req() req: Request) {
		const payload = {
			email: req.user['email'],
			isTwoFactorAuthenticated: false,
		};
		const accessToken = this.jwtService.sign(payload);
		res.cookie('jwt', accessToken, {httpOnly: true});
		if (req.user['isTwoFactorAuthenticationEnabled'])
		{
			console.log("2FA!");
			res.redirect(`http://${process.env.HOST_IP}:3000/auth/2FA`);
		}
		res.redirect(`http://${process.env.HOST_IP}:3000`);
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('enable')
	async enable(@Req() request: any) {
		this.twoFactorAuthenticationService.enableTwoFactorAuthentication(request.user);
	}

	@UseGuards(AuthGuard('2FA'))
	@Get('disable')
	async disable(@Req() request: any, @Res({passthrough: true}) response: Response) {
		await this.twoFactorAuthenticationService.deleteTwoFactorAuthenticationSecret(request.user);
		await this.twoFactorAuthenticationService.disableTwoFactorAuthentication(request.user);
		const payload = {
			email: request.user.email,
			isTwoFactorAuthenticated: false,
		};
		const accessToken = this.jwtService.sign(payload);
		response.cookie('jwt', accessToken, {httpOnly: true});
		return { isTwoFactorAuthenticated: false};
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('generate')
	async register(@Res() response: Response, @Req() request: any) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('validate')
	async verify(@Req() req: any, @Res({passthrough: true}) res: Response, @Body('code') code: string | null) {
		const regex = /^\d{6}$/;
		if (!regex.test(code))
			throw new HttpException('Invalid 2FA code', HttpStatus.NOT_ACCEPTABLE);
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(code, req.user);
		if (!isCodeValid)
			throw new HttpException('Wrong 2FA code', HttpStatus.NOT_ACCEPTABLE);
		const payload = {
			email: req.user.email,
			isTwoFactorAuthenticated: true,
		};
		const accessToken = this.jwtService.sign(payload);
		res.cookie('jwt', accessToken, {httpOnly: true});
		return { valid: true};
	}

}