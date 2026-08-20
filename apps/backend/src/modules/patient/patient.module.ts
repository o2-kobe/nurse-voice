import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), DoctorModule],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
