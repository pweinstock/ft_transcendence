import { Controller, Get, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from './Guards';

@Controller('auth/42')
export class AuthController {

    @Get('login')
    @UseGuards(FortyTwoAuthGuard)
    login() {
        return { msg: 'Login' };
    }

    @Get('/redirect')
    @UseGuards(FortyTwoAuthGuard)
    redirect() {
     return { msg: 'Redirect' };
    }
}
