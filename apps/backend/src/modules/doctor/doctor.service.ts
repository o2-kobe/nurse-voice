import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async findDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOneBy({ id });

    if (!doctor) {
      throw new NotFoundException('Doctor does not exist');
    }

    return doctor;
  }
}
