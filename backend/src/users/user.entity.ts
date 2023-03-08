import { Chat } from "src/chat/chat.entity";
import { Message } from "src/chat/message/message.entity";
import {Column, PrimaryGeneratedColumn, Entity, ManyToMany, JoinTable, OneToMany} from "typeorm";

@Entity({name: 'user'})
export class User {
   @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    displayName: string;    

    @Column({ nullable: true })
    photo?: string;

    @Column({ default: true })
    isOnline: boolean;

    @Column('integer', {array: true, default: null, nullable: true})
    pendingFriends: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    bannedUsers: number[];

    @ManyToMany(() => User)
    @JoinTable()
    friends: User[];

    @ManyToMany(() => Chat, chat => chat.users)
    @JoinTable()
    chats: Chat[];

    @OneToMany(() => Message, message => message.sender)
    messages: Message[];
}
