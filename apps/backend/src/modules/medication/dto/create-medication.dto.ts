import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @Length(9)
  patientCode!: string;

  @IsNotEmpty()
  @IsString()
  medicationName!: string;

  @IsNotEmpty()
  @IsString()
  dosage!: string;
}
