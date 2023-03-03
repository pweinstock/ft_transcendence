import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity({name: 'roles'})
export class Role {
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
}