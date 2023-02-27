import { Controller, Get } from '@nestjs/common';
import { createUserDTO } from 'src/users/dto/create-useer.dto';

@Controller('auth')
export class AuthController {

    @Get('42')
    login() {
        return { msg: 'Login' };
    }

    @Get('/')
    redirect() {
     return { msg: 'Redirect' };
    }
}
