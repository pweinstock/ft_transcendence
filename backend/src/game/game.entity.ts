import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity({name: 'history'})
export class GameEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstPlayer: string;

    @Column()
    secondPlayer: string;

    @Column()
    score: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
