import { Controller, Get, Post, Body} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Get()
    getAll() {
        return this.usersService.findAll();
    }

    @Post()
    createUser(@Body() userDto: UserDTO) {
        return this.usersService.createUser(userDto);
    }
}
