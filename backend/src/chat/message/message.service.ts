import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Message} from "./message.entity";
import {CreateMessageDto} from "./dto/create-message.dto";

@Injectable()
export class MessageService {
    constructor(@InjectRepository(Message) private messageRepository: Repository<Message>) {}

    async createMessage(dto: CreateMessageDto) : Promise<Message> {
        const message = await this.messageRepository.create(dto);
        return this.messageRepository.save(message);
    }

    async findMessageById(messageId : string) : Promise<Message> {
        const message = await this.messageRepository.findOneBy({id : messageId});
        if (!message)
            throw new HttpException('Message not found!', HttpStatus.NOT_FOUND);
        return message;
    }

    async deleteMessage(messageId : string) : Promise<void> {
        await this.messageRepository.delete(messageId);
    }
}