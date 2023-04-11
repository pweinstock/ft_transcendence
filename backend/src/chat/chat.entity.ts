import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

export enum ChatType {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected",
    DIRECT = "direct",
};

export interface MutedUser {
    userId: string;
    unmuteDate: Date;
}

@Entity({name: 'chat'})
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({nullable: true})
    password?: string;

    @Column({type: 'enum', enum: ChatType, default: [ChatType.PUBLIC]})
    type: ChatType;

    @Column("text", {array: true, default: [], nullable: false})
    admins: string[];

    @Column("text", {array: true, default: [], nullable: false})
    bannedUsers: string[];

    @Column({type: 'jsonb', array: false, default: () => "'[]'", nullable: false})
    mutedUsers: Array<MutedUser>;

    @Column("text", {nullable: true})
    owner: string;

    @Column("text", {array: true, default: [], nullable: false})
    users: string[];

    @Column("text", {array: true, default: [], nullable: false})
    messages: string[];
}