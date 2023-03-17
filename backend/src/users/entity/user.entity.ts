import {Column, PrimaryGeneratedColumn, Entity, OneToMany} from "typeorm";
import {MatchHistory} from "./match-history.entity";

export enum UserStatus {
    ONLINE = "online",
    INGAME = "ingame",
    OFFLINE = "offline"
};

@Entity({name: 'user'})
export class User {
   @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    displayName: string;    

    @Column({ nullable: true })
    photo?: string;

    @Column({type: 'enum', enum: UserStatus, default: [UserStatus.ONLINE]})
    status: UserStatus;

    @Column('integer', {array: true, default: null, nullable: true})
    pendingFriends: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    bannedUsers: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    friends: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    messages: number[];

    @Column('integer', {array: true, default: null, nullable: true})
    chats: number[];

    @Column()
    wins : number;

    @Column()
    losses : number;

    @Column({array: true, default: null, nullable: true})
    @OneToMany(() => MatchHistory, (history) => history)
    history : MatchHistory[];
}