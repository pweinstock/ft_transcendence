import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Message} from "./message.entity";
import {AddMessageDto} from "./dto/add-message.dto";

@Injectable()
export class MessageService {
    constructor(@InjectRepository(Message) private messageRepository: Repository<Message>) {}

    async createMessage(dto: AddMessageDto) : Promise<Message> {
        const message = await this.messageRepository.create(dto);
        return this.messageRepository.save(message);
    }

    async findMessageById(messageId : number) : Promise<Message> {
        const message = await this.messageRepository.findOneBy({id : messageId});
        return message;
    }

    async deleteMessage(messageId : number) : Promise<void> {
        await this.messageRepository.delete(messageId);
    }
}