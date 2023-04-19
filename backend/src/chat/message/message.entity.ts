import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'message'})
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column()
  displayName: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column()
  userId: string;

  @Column()
  chatId: string;
}