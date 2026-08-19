import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BedStatus } from '../entities/bed.entity';

export class CreateBedDto {
  @IsString()
  bedNumber!: string;

  @IsString()
  ward!: string;

  @IsEnum(BedStatus)
  status!: BedStatus;
}

export class GetBedDto {
  @IsString()
  bedNumber!: string;
}

export class GetAvailableBedsDto {
  @IsOptional()
  ward?: string;
}
