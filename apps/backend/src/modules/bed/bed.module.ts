import { Module } from '@nestjs/common';
import { BedService } from './bed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bed } from './entities/bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bed])],
  providers: [BedService],
  exports: [BedService],
})
export class BedModule {}
