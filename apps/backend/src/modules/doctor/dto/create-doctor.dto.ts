import { IsString, Length } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  name!: string;

  @IsString()
  department!: string;

  @IsString()
  @Length(10, 10)
  phoneNumber!: string;
}
