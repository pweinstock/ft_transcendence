import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import {User} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";


@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>,) {
    }

    async createUser(dto: UserDTO): Promise<User> {
        const user = this.userRepository.create(dto);
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find()
        return users;
    }

    async findByEmail(userEmail: string): Promise<User> {
        const user = await this.userRepository.findOneBy({email: userEmail});
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        return user;
    }

    async findById(userId: number): Promise<User> {
        const user = await this.userRepository.findOneBy({id: userId});
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        return user;
    }

    async remove(userId: number) : Promise<void> {
        await this.userRepository.delete(userId);
    }

    addMessage(messageId: number, user : User) : void {
        user.messages.push(messageId);
        this.userRepository.save(user);
    }

    deleteMessage(messageId: number, user : User) : void {
        user.messages = user.messages.filter((message) => message != messageId);
        this.userRepository.save(user);
    }
}

