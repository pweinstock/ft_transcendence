import { Injectable } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import {User} from "./users.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";


@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async createUser(dto: UserDTO) {
        const user = this.usersRepository.create(dto);
        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        const users = await this.usersRepository.find()
        return users;
    }

    async findOne(email: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({ email });
        return user;
    }

    async remove(email: string): Promise<void> {
        await this.usersRepository.delete(email);
    }
}
