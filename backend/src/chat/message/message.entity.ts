import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'message'})
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  displayName: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({type: "integer", nullable:true})
  user: number;

  @Column({type: "integer", array: true, nullable:true})
  chat: number[];
}