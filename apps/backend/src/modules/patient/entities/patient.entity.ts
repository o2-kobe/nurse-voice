import { Bed } from 'src/modules/bed/entities/bed.entity';
import { DoctorFlag } from 'src/modules/doctor-flag/entities/doctor-flag.entity';
import { Doctor } from 'src/modules/doctor/entities/doctor.entity';
import { Medication } from 'src/modules/medication/entities/medication.entity';
import { VitalReading } from 'src/modules/vital-reading/entities/vitalReading.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PatientGender {
  MALE = 'M',
  FEMALE = 'F',
  UNKNOWN = 'U',
}

@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 9 })
  patientCode!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({
    type: 'enum',
    enum: PatientGender,
    default: PatientGender.UNKNOWN,
  })
  gender!: PatientGender;

  @OneToOne(() => Bed, (bed) => bed.currentPatient, { nullable: true })
  bed!: Bed | null;

  @ManyToOne(() => Doctor, { nullable: true })
  assignedDoctor!: Doctor | null;

  @OneToMany(() => VitalReading, (vitalReading) => vitalReading.patient, {
    nullable: true,
  })
  vitalReadings!: VitalReading[] | null;

  @OneToMany(() => Medication, (medication) => medication.patient, {
    nullable: true,
  })
  medications!: Medication[] | null;

  @OneToMany(() => DoctorFlag, (flag) => flag.patient, { nullable: true })
  doctorFlags!: DoctorFlag[] | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper to get age dynamically
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
