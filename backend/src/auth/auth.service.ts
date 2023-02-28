import { Injectable } from '@nestjs/common';
import { UserDTO } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async validateUser(details: UserDTO) {
        const user = await this.usersService.findOne(details.email);
        if (!user) {
            
        }

    }
}
