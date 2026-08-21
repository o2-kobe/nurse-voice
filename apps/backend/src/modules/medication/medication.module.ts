import { Module } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medication } from './entities/medication.entity';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medication]), PatientModule],
  providers: [MedicationService],
  exports: [MedicationService],
})
export class MedicationModule {}
