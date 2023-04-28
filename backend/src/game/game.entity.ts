import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity({name: 'game'})
export class Game {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable : true})
    winner : string;

    @Column()
    firstPlayer: string;

    @Column({nullable : true, default: null})
    secondPlayer: string;

    @Column({default: 0})
    firstPlayerScore: number;

    @Column({default: 0})
    secondPlayerScore: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    date: Date;

    @Column({default: false})
    finished : boolean
}
