import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { DoctorModule } from '../doctor/doctor.module';
import { BedModule } from '../bed/bed.module';
import { PatientController } from './patient.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), DoctorModule, BedModule],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
