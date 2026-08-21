import { IsInt, IsNumber, IsNotEmpty, Min, Max, Length } from 'class-validator';

export class CreateVitalReadingDto {
  @IsNotEmpty()
  @Length(9)
  patientCode!: string;

  @IsInt()
  @Min(0)
  @Max(300)
  @IsNotEmpty()
  systolicBP!: number;

  @IsInt()
  @Min(0)
  @Max(200)
  @IsNotEmpty()
  diastolicBP!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(45)
  @IsNotEmpty()
  temperature!: number;

  @IsInt()
  @Min(0)
  @Max(300)
  @IsNotEmpty()
  heartRate!: number;
}
