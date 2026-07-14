import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type OAuthProvider = 'github' | 'google';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  provider!: OAuthProvider;

  @Column()
  providerId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
