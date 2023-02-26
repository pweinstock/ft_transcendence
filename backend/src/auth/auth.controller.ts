import { Controller, Post } from '@nestjs/common';
import { createUserDTO } from 'src/users/dto/create-useer.dto';

@Controller('auth')
export class AuthController {

    @Post('/login')
    login(@Body() userDto : createUserDTO ) {

    }
}
