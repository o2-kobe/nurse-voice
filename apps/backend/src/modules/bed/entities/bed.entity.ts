import { Patient } from 'src/modules/patient/entities/patient.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
}

@Entity()
@Unique(['ward', 'bedNumber'])
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  bedNumber!: string;

  @Index()
  @Column()
  ward!: string;

  @Column({ type: 'enum', enum: BedStatus, default: BedStatus.AVAILABLE })
  status!: BedStatus;

  @OneToOne(() => Patient, (patient) => patient.bed, { nullable: true })
  @JoinColumn()
  currentPatient!: Patient | null;
}
