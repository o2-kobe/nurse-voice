import { Bed } from 'src/modules/bed/entities/bed.entity';
import { Doctor } from 'src/modules/doctor/entities/doctor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PatientGender {
  MALE = 'M',
  FEMALE = 'F',
  UNKNOWN = 'U',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @OneToOne(() => Bed, (bed) => bed.currentPatient)
  bed?: Bed;

  @ManyToOne(() => Doctor, { nullable: true })
  assignedDoctor?: Doctor;

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
