import {Column, DataType, Model, Table} from "sequelize-typescript";


interface UserCreation {
    id: string;
    email: string;
    displayName: string;
    photo: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreation>{
    @Column({type: DataType.STRING, unique: true, primaryKey: true})
    id: string;

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    displayName: string;    

    @Column({type: DataType.STRING, allowNull: false})
    photo: string;

    @Column({type: DataType.INTEGER})
    friends: number;

    @Column({type: DataType.INTEGER})
    pendingFriends: number;

    @Column({type: DataType.INTEGER})
    bannedUsers: number;
}