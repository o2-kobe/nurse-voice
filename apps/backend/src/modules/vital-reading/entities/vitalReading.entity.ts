import { Patient } from 'src/modules/patient/entities/patient.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('vital_readings')
export class VitalReading {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, (patient) => patient.vitalReadings)
  patient!: Patient;

  @Column({ type: 'int' })
  systolicBP!: number;

  @Column({ type: 'int' })
  diastolicBP!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature!: number;

  @Column({ type: 'int' })
  heartRate!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  recordedAt!: Date;
}
