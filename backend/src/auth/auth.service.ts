import { Injectable } from '@nestjs/common';
import { UserDTO } from 'src/users/dto/user.dto';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UserService) {}

    async validateUser(dto: UserDTO) {
        const user = await this.usersService.findByEmail(dto.email);
        if (user) {
            return user;
        }
        const newUser = this.usersService.createUser(dto);
        return newUser;
    }
}
