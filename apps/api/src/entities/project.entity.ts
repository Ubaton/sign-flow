import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity.js';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  owner!: UserEntity;

  @Column()
  ownerId!: string;

  @Index({ unique: true })
  @Column()
  publicKey!: string;

  @Index({ unique: true })
  @Column()
  secretKey!: string;

  @Index({ unique: true })
  @Column()
  testPublicKey!: string;

  @Index({ unique: true })
  @Column()
  testSecretKey!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
