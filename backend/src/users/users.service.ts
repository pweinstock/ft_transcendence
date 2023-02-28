import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserDTO } from './dto/user.dto';
import {User} from "./users.model";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userModel: typeof User) {}

    async createUser(dto: UserDTO) {
        const user = await this.userModel.create(dto);
        return user;
    }

    async getAllUsers() {
        const users = await this.userModel.findAll();
        return users;
    }

    findOne(userEmail: string): Promise<User> {
        return this.userModel.findOne({
          where: { email: userEmail },
        });
    }

    async remove(email: string): Promise<void> {
        const user = await this.findOne(email);
        if (user)
            await user.destroy();
    }
}
