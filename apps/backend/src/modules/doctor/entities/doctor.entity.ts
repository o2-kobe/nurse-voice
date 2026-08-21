import { DoctorFlag } from 'src/modules/doctor-flag/entities/doctor-flag.entity';
import { Patient } from 'src/modules/patient/entities/patient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 9 })
  doctorCode!: string;

  @Column()
  name!: string;

  @Column()
  department!: string;

  @Column({ type: 'varchar', length: 10 })
  phoneNumber!: string;

  @OneToMany(() => Patient, (patient) => patient.assignedDoctor, {
    nullable: true,
  })
  assignedPatients!: Patient[] | null;

  @OneToMany(() => DoctorFlag, (flags) => flags.doctor, { nullable: true })
  doctorFlags!: DoctorFlag[] | null;

  @CreateDateColumn()
  createdAt!: Date;
}
