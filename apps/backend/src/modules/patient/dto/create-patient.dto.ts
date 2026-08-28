import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PatientGender } from '../entities/patient.entity';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsNumber()
  age!: number;

  @IsEnum(PatientGender)
  gender!: PatientGender;

  @IsString()
  @IsNotEmpty()
  ward!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bedNumber?: string;

  @IsOptional()
  @Length(9)
  assignedDoctorCode?: string;
}
