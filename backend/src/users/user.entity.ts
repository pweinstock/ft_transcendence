import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";


@Entity({name: 'user'})
export class User {
   @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string
    @Column({ unique: true })
    displayName: string;    

    @Column({ nullable: true })
    photo: string;

    @Column({default: 'online', nullable: false})
    status: string;

    @Column("text", {array: true, default: null, nullable: true})
    bannedUsers: string[];

    @Column("text", {array: true, default: null, nullable: true})
    pendingFriends: string[];

    @Column("text", {array: true, default: null, nullable: true})
    friends: string[];

    @Column("text", {array: true, default: null, nullable: true})
    chats: string[];

    @Column("text", {array: true, default: null, nullable: true})
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