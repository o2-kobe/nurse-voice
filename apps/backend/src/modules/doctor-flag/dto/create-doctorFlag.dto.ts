import { IsEnum, IsString, Length } from 'class-validator';
import { AlertStatus, UrgencyLevel } from '../entities/doctor-flag.entity';

export class CreateDoctorFlagDto {
  @IsString()
  @Length(9)
  patientCode!: string;

  @IsString()
  @Length(9)
  doctorCode!: string;

  @IsEnum(UrgencyLevel)
  urgency!: UrgencyLevel;

  @IsString()
  reason!: string;
}
