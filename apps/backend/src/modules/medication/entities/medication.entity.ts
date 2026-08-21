import { Patient } from 'src/modules/patient/entities/patient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, (patient) => patient.medications, { eager: true })
  patient!: Patient;

  @Column()
  medicationName!: string;

  @Column()
  dosage!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  administeredAt!: Date;
}
