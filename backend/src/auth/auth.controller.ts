import { Controller, Get, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from './auth.guard';

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
