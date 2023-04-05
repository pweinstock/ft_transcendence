import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

export enum ChatType {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected",
    DIRECT = "direct",
};

export interface MutedUser {
    userId: number;
    unmuteDate: Date;
}

@Entity({name: 'chat'})
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    password?: string;

    @Column({type: 'enum', enum: ChatType, default: [ChatType.PUBLIC]})
    type: ChatType;

    @Column('integer', {array: true, default: null, nullable: true})
    admins: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    bannedUsers: number[];

    @Column('simple-json', {array: true, default: null, nullable: true})
    mutedUsers: MutedUser[];

    @Column('integer', {nullable: true})
    owner: number;

    @Column('integer', {array: true, default: null, nullable: true})
    users: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    messages: number[];
}