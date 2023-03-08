import { Injectable } from '@nestjs/common';
import { UserDTO } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/user.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async validateUser(dto: UserDTO) {
        const user = await this.usersService.findOne(dto.email);
        if (user) {
            return user;
        }
        const newUser = this.usersService.createUser(dto);
        return newUser;
    }
}
