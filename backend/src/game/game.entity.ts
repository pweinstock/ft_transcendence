import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity({name: 'history'})
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstPlayer: string;

    @Column()
    secondPlayer: string;

    @Column()
    firstPlayerScore: number;

    @Column()
    secondPlayerScore: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
