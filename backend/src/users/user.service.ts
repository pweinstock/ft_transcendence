import { Injectable } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import {User} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";


@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>,) {}

    async createUser(dto: UserDTO) {
        const user = this.userRepository.create(dto);
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find()
        return users;
    }

    async findByEmail(userEmail: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ email : userEmail });
        return user;
    }

    async findById(userId: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id : userId });
        return user;
    }

    async remove(email: string): Promise<void> {
        await this.userRepository.delete(email);
    }


}
