import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectEntity } from './project.entity.js';

export type InputType = 'touch' | 'pen' | 'mouse';

export interface DeviceData {
  userAgent: string;
  inputType: InputType;
  pressureSupported: boolean;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

@Entity('signatures')
export class SignatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  signature!: string;

  @CreateDateColumn()
  date!: Date;

  @Column({ type: 'jsonb', nullable: true })
  location!: GeoLocation | null;

  @Column({ type: 'jsonb' })
  deviceData!: DeviceData;

  @Column()
  siteUrl!: string;

  @Column()
  pageName!: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  project!: ProjectEntity;

  @Index()
  @Column()
  projectId!: string;

  @Column()
  createdBy!: string;

  /** True if captured with a pk_test_/sk_test_ key — kept out of live retrieval by default. */
  @Index()
  @Column({ default: false })
  isTest!: boolean;
}
