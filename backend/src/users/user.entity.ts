import { Chat } from "src/chat/chat.entity";
import {Column, PrimaryGeneratedColumn, Entity, ManyToMany, JoinTable, ManyToOne, OneToMany} from "typeorm";

@Entity({name: 'user'})
export class User {
   @PrimaryGeneratedColumn()
    id: string;

    @Column()
    email: string;

    @Column()
    displayName: string;    

    @Column({ nullable: true })
    photo?: string;

    @ManyToMany(() => User)
    @JoinTable()
    friends: User[];

    @ManyToMany(() => User)
    @JoinTable()
    pendingFriends: User[];

    @ManyToMany(() => User)
    @JoinTable()
    bannedUsers: User[];

    @Column({ default: true })
    isOnline: boolean;

    @ManyToMany(() => Chat)
    @JoinTable()
    chats: Chat[];

    @OneToMany(() => Chat, (chat) => chat.owner)
    ownedChats: Chat[];
}