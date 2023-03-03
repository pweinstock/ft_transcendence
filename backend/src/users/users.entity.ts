import { Chat } from "src/chat/chat.entity";
import { UserChats } from "src/chat/user-chats.entity";
import {Column, PrimaryGeneratedColumn, Entity, ManyToMany} from "typeorm";

@Entity({name: 'users'})
export class User {
   @PrimaryGeneratedColumn()
    id: string;

    @Column()
    email: string;

    @Column()
    displayName: string;    

    @Column()
    photo: string;

    @Column('integer', {array: true, nullable: true, default: null})
    friends: number[];

    @Column('integer', {array: true, nullable: true, default: null})
    pendingFriends: number[];

    @Column('integer', {array: true, nullable: true, default: null})
    bannedUsers: number[];

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => Chat, () => UserChats)
    chats: Chat[];
}