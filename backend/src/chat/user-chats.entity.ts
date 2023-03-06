import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'user_chats'})
export class UserChats {
   @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    userId: number;
}