import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicationDto {
  @IsNotEmpty()
  @IsString()
  medicationName!: string;

  @IsNotEmpty()
  @IsString()
  dosage!: string;
}
