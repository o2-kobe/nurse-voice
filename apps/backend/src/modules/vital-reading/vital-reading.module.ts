import { Module } from '@nestjs/common';
import { VitalReadingService } from './vital-reading.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalReading } from './entities/vitalReading.entity';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [TypeOrmModule.forFeature([VitalReading]), PatientModule],
  providers: [VitalReadingService],
  exports: [VitalReadingService],
})
export class VitalReadingModule {}
