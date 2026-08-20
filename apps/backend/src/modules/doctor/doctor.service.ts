import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { ILike, Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorRepo.save(this.doctorRepo.create(dto));
  }

  async findDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOneBy({ id });

    if (!doctor) {
      throw new NotFoundException('Doctor does not exist');
    }

    return doctor;
  }

  async findDoctorByName(name: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({
      where: {
        name: ILike(`%${name}%`),
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with name ${name} not found.`);
    }

    return doctor;
  }
}
