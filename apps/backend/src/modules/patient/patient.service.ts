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
import {
  CodeGeneratorService,
  CodePrefix,
} from '../code-generator/code-generator.service';
import { BedService } from '../bed/bed.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    private readonly bedService: BedService,
    private readonly dataSource: DataSource,
    private readonly doctorService: DoctorService,
    private readonly codeGeneratorService: CodeGeneratorService,
  ) {}

  async createPatient(dto: CreatePatientDto): Promise<Patient> {
    // Verify assigned doctor exists
    let assignedDoctor: Doctor | null = null;
    let bed: Bed | null = null;

    if (dto.assignedDoctorCode) {
      assignedDoctor = await this.doctorService.findByCode(
        dto.assignedDoctorCode,
      );

      if (!assignedDoctor) {
        throw new NotFoundException(
          `Doctor with code "${dto.assignedDoctorCode}" not found.`,
        );
      }
    }

    //  Normalize inputs
    const normalizedWard = dto.ward.trim();

    if (dto.bedNumber) {
      const normalizedBed = dto.bedNumber.trim();

      // Verify bed existence and status
      bed = await this.bedService.findBedInWard({
        ward: normalizedWard,
        bedNumber: normalizedBed,
      });

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
    }

    // Create Patient & Lock Bed atomically inside a Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate guaranteed unique 6-character code using transactional manager
      const patientCode = await this.codeGeneratorService.generateUniqueCode({
        entity: Patient,
        columnName: 'patientCode',
        prefix: CodePrefix.PATIENT,
        manager: queryRunner.manager,
      });

      // Convert age to an approximate dateOfBirth
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - dto.age);

      const patient = this.patientRepo.create({
        patientCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth,
        gender: dto.gender,
        assignedDoctor: assignedDoctor ?? undefined,
        bed: dto.bedNumber ? bed : null,
      });

      const savedPatient = await queryRunner.manager.save(Patient, patient);
      if (bed) {
        bed.status = BedStatus.OCCUPIED;
        bed.currentPatient = savedPatient;
        await queryRunner.manager.save(Bed, bed);
      }

      await queryRunner.commitTransaction();
      return savedPatient;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByCode(patientCode: string): Promise<Patient> {
    const normalizedCode = patientCode.trim().toUpperCase();
    const patient = await this.patientRepo.findOne({
      where: { patientCode: normalizedCode },
      relations: { bed: true, assignedDoctor: true },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with code "${normalizedCode}" not found.`,
      );
    }

    return patient;
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

  async assignDoctorToPatient(patientCode: string, doctorCode: string) {
    const [patient, doctor] = await Promise.all([
      this.findByCode(patientCode),
      this.doctorService.findByCode(doctorCode),
    ]);

    patient.assignedDoctor = doctor;

    return this.patientRepo.save(patient);
  }
}
