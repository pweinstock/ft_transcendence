import { Body, Controller, Get, Post } from '@nestjs/common';
import { createUserDTO } from './dto/create-useer.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Post()
    create(@Body() userDto: createUserDTO) {
        return this.usersService.createUser(userDto);
    }

    @Get()
    getAll() {
        return this.usersService.getAllUsers();
    }
}
