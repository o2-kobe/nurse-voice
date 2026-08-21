import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  Length,
} from 'class-validator';
import { AlertStatus } from '../entities/doctor-flag.entity';

export class ResolveDoctorFlagDto {
  @IsString()
  @Length(9)
  flagCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Resolution notes cannot exceed 1000 characters.',
  })
  notes?: string;

  @IsOptional()
  @IsEnum(AlertStatus, {
    message: `Status must be either ${AlertStatus.RESOLVED} or ${AlertStatus.DISMISSED}.`,
  })
  status?: AlertStatus.RESOLVED | AlertStatus.DISMISSED;
}
