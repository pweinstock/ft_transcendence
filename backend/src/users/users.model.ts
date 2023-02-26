import {Column, DataType, Model, Table} from "sequelize-typescript";


interface UserCreation {
    email: string;
    password: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreation>{
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    // @Column({type: DataType.STRING, unique: true, allowNull: false})
    // name: string;

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @Column({type: DataType.STRING, allowNull: false})
    password: string;

    @Column({type: DataType.INTEGER, unique: true})
    friends: number[];

    @Column({type: DataType.INTEGER, unique: true})
    pendingFriends: number[];

    @Column({type: DataType.INTEGER, unique: true})
    bannedUsers: number[];
}