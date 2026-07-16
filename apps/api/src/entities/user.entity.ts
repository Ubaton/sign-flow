import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type OAuthProvider = 'github' | 'google';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  /** Display name or handle from the OAuth provider; may be null if unset. */
  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column()
  provider!: OAuthProvider;

  @Column()
  providerId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
