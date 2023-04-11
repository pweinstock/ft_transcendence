import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

export enum UserStatus {
    ONLINE = "online",
    INGAME = "ingame",
    OFFLINE = "offline"
};

@Entity({name: 'user'})
export class User {
   @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    displayName: string;    

    @Column({ nullable: true , default: "littleman.png"})
    photo: string;

    @Column({type: 'enum', enum: UserStatus, default: [UserStatus.ONLINE]})
    status: UserStatus;

    @Column("text", {array: true, default: [], nullable: false})
    bannedUsers: string[];

    @Column("text", {array: true, default: [], nullable: false})
    pendingFriends: string[];

    @Column("text", {array: true, default: [], nullable: false})
    friends: string[];

    @Column("text", {array: true, default: [], nullable: false})
    chats: string[];

    @Column("text", {array: true, default: [], nullable: false})
    matchHistory : string[];

    @Column('integer', {default: 0})
    wins : number;

    @Column('integer', {default: 0})
    losses : number;

    @Column('integer', {default: 0})
    draws : number;

    @Column('integer', {default: 0})
    score : number;

	@Column({default: false})
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({nullable: true})
	TwoFactorAuthenticationSecret: string;

    @Column({default: true})
	first: boolean;
}