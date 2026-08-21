import { Doctor } from 'src/modules/doctor/entities/doctor.entity';
import { Patient } from 'src/modules/patient/entities/patient.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity('doctor_flags')
export class DoctorFlag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 9 })
  flagCode!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  patient!: Patient;

  @ManyToOne(() => Doctor)
  doctor!: Doctor;

  @Column({
    type: 'enum',
    enum: UrgencyLevel,
    default: UrgencyLevel.LOW,
  })
  urgency!: UrgencyLevel;

  @Column('text')
  reason!: string;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.PENDING,
  })
  status!: AlertStatus;

  @Column('text', { nullable: true })
  resolutionNotes?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
