import { Module } from '@nestjs/common';
import { DoctorFlagService } from './doctor-flag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorFlag } from './entities/doctor-flag.entity';
import { PatientModule } from '../patient/patient.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorFlag]),
    PatientModule,
    DoctorModule,
  ],
  providers: [DoctorFlagService],
  exports: [DoctorFlagService],
})
export class DoctorFlagModule {}
