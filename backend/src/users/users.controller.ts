import { Controller, Get, UseGuards} from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Get()
    getAll() {
        return this.usersService.getAllUsers();
    }
}
