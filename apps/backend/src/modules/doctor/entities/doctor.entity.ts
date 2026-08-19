import { Patient } from 'src/modules/patient/entities/patient.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  department!: string;

  @Column({ type: 'decimal', scale: 2, precision: 10 })
  phoneNumber!: string;

  @OneToMany(() => Patient, (patient) => patient.assignedDoctor, {
    nullable: true,
  })
  assignedPatients!: Patient[] | null;
}
