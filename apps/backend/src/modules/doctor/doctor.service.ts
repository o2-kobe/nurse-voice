import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { ILike, Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import {
  CodeGeneratorService,
  CodePrefix,
} from '../code-generator/code-generator.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,

    private readonly codeGeneratorService: CodeGeneratorService,
  ) {}

  async createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
    const doctorCode = await this.codeGeneratorService.generateUniqueCode({
      entity: Doctor,
      columnName: 'doctorCode',
      prefix: CodePrefix.DOCTOR,
    });

    const doctor = this.doctorRepo.create({
      ...dto,
      doctorCode,
    });

    return await this.doctorRepo.save(doctor);
  }

  async findByCode(doctorCode: string): Promise<Doctor> {
    const normalizedCode = doctorCode.trim().toUpperCase();
    const doctor = await this.doctorRepo.findOneBy({
      doctorCode: normalizedCode,
    });

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with code "${normalizedCode}" not found.`,
      );
    }

    return doctor;
  }

  async findDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOneBy({ id });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID "${id}" does not exist.`);
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
