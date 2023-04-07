import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity({name: 'game'})
export class Game {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstPlayer: string;

    @Column()
    secondPlayer: string;

    @Column()
    firstPlayerScore: string;

    @Column()
    secondPlayerScore: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column({default: false})
    finished : boolean
}
