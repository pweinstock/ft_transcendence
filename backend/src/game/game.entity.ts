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

    @Column({default: "0"})
    firstPlayerScore: string;

    @Column({default: "0"})
    secondPlayerScore: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    date: string;

    @Column({default: false})
    finished : boolean
}
