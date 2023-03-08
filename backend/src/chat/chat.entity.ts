import { User } from "src/users/user.entity";
import {Column, PrimaryGeneratedColumn, Entity, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { Message } from "./message.entity";

export enum ChatType {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected",
    DIRECT = "direct",
};

@Entity({name: 'chat'})
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    password?: string;

    @Column({
        type: "enum",
        enum: ChatType,
        default: [ChatType.PUBLIC]
    })
    type: ChatType;

    @Column('integer', {array: true, default: null, nullable: true})
    admins: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    bannedUsers: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    mutedUsers: number[];

    @ManyToOne(() => User)
    owner: User;

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];

    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];
}