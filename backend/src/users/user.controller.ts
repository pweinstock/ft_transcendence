import { Controller, Get, Post, Body} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

    constructor(private usersService: UserService) {}

    @Get()
    getAll() {
        return this.usersService.findAll();
    }

    @Post()
    create(@Body() userDto: UserDTO) {
        return this.usersService.createUser(userDto);
    }
}
