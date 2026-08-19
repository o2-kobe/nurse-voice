import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './entities/patient.entity';
import { Bed, BedStatus } from '../bed/entities/bed.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { DoctorService } from '../doctor/doctor.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Bed) private readonly bedRepo: Repository<Bed>,
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
    private readonly dataSource: DataSource,

    private readonly doctorService: DoctorService,
  ) {}

  async createPatient(dto: CreatePatientDto): Promise<Patient> {
    // Verify assigned doctor exists
    let assignedDoctor: Doctor | null = null;
    if (dto.assignedDoctorId) {
      assignedDoctor = await this.doctorRepo.findOneBy({
        id: dto.assignedDoctorId,
      });
      if (!assignedDoctor) {
        throw new NotFoundException(
          `Doctor with ID "${dto.assignedDoctorId}" not found.`,
        );
      }
    }

    // Normalize inputs (strips extra spaces, case-insensitive query)
    const normalizedWard = dto.ward.trim();
    const normalizedBed = dto.bedNumber.trim();

    // Check bed existence
    const bed = await this.bedRepo.findOne({
      where: { ward: normalizedWard, bedNumber: normalizedBed },
      relations: { currentPatient: true },
    });

    if (!bed) {
      throw new NotFoundException(
        `Bed "${normalizedBed}" in "${normalizedWard}" does not exist in the hospital setup.`,
      );
    }

    // Check Bed status
    if (bed.status === BedStatus.OCCUPIED || bed.currentPatient) {
      throw new ConflictException(
        `${normalizedBed} in ${normalizedWard} is already occupied.`,
      );
    }

    if (bed.status !== BedStatus.AVAILABLE) {
      throw new BadRequestException(
        `${normalizedBed} in ${normalizedWard} is currently marked as "${bed.status}" and cannot accept patients.`,
      );
    }

    //  Create Patient & Lock Bed atomically
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const patient = this.patientRepo.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        age: dto.age,
        gender: dto.gender,
        assignedDoctor: assignedDoctor ?? undefined,
        bed: bed,
      });

      const savedPatient = await queryRunner.manager.save(Patient, patient);

      bed.status = BedStatus.OCCUPIED;
      bed.currentPatient = savedPatient;
      await queryRunner.manager.save(Bed, bed);

      await queryRunner.commitTransaction();
      return savedPatient;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findPatientByBedBumber(bedNumber: string) {
    const normalizedBedNumber = bedNumber.trim();

    const patient = await this.patientRepo.findOne({
      where: {
        bed: { bedNumber: normalizedBedNumber },
      },
      relations: { assignedDoctor: true },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with bed number ${normalizedBedNumber} does not exist.`,
      );
    }

    return patient;
  }

  async findPatientById(id: string) {
    const patient = await this.patientRepo.findOneBy({ id });

    if (!patient) {
      throw new NotFoundException('Patient does not exist');
    }

    return patient;
  }

  async assignDoctorToPatient(patientId: string, doctorId: string) {
    const [patient, doctor] = await Promise.all([
      this.findPatientById(patientId),
      this.doctorService.findDoctorById(doctorId),
    ]);

    patient.assignedDoctor = doctor;

    return this.patientRepo.save(patient);
  }
}
