import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './modules/patient/entities/patient.entity';
import { Bed } from './modules/bed/entities/bed.entity';
import { Doctor } from './modules/doctor/entities/doctor.entity';
import { VitalReading } from './modules/vital-reading/entities/vitalReading.entity';
import { DoctorFlag } from './modules/doctor-flag/entities/doctor-flag.entity';
import { BedModule } from './modules/bed/bed.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { DoctorFlagModule } from './modules/doctor-flag/doctor-flag.module';
import { MedicationModule } from './modules/medication/medication.module';
import { NurseAgentModule } from './modules/nurse-agent/nurse-agent.module';
import { CodeGeneratorModule } from './modules/code-generator/code-generator.module';
import { PatientModule } from './modules/patient/patient.module';
import { Medication } from './modules/medication/entities/medication.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'nurse_voice',
      entities: [Patient, Bed, Doctor, VitalReading, DoctorFlag, Medication],
      autoLoadEntities: true,
      synchronize: true, // DEV ONLY — auto-creates tables from entities
    }),

    PatientModule,
    BedModule,
    DoctorModule,
    DoctorFlagModule,
    MedicationModule,
    NurseAgentModule,
    CodeGeneratorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
