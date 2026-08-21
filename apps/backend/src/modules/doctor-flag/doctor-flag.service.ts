import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertStatus, DoctorFlag } from './entities/doctor-flag.entity';
import { Repository } from 'typeorm';
import { CreateDoctorFlagDto } from './dto/create-doctorFlag.dto';
import { PatientService } from '../patient/patient.service';
import { DoctorService } from '../doctor/doctor.service';
import { ResolveDoctorFlagDto } from './dto/resolveDoctorFlag.dto';
import {
  CodeGeneratorService,
  CodePrefix,
} from '../code-generator/code-generator.service';

@Injectable()
export class DoctorFlagService {
  constructor(
    @InjectRepository(DoctorFlag)
    private readonly doctorFlagRepo: Repository<DoctorFlag>,

    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
    private readonly codeGeneratorService: CodeGeneratorService,
  ) {}

  async createDoctorFlag(dto: CreateDoctorFlagDto): Promise<DoctorFlag> {
    const { patientCode, doctorCode, reason, urgency } = dto;

    const [patient, doctor] = await Promise.all([
      this.patientService.findByCode(patientCode),
      this.doctorService.findByCode(doctorCode),
    ]);

    const flagCode = await this.codeGeneratorService.generateUniqueCode({
      entity: DoctorFlag,
      columnName: 'flagCode',
      prefix: CodePrefix.FLAG,
    });

    const flag = this.doctorFlagRepo.create({
      flagCode,
      reason,
      urgency,
      patient,
      doctor,
      status: AlertStatus.PENDING,
    });

    return await this.doctorFlagRepo.save(flag);
  }

  async findFlagByCode(flagCode: string): Promise<DoctorFlag> {
    const normalizedCode = flagCode.trim().toUpperCase();

    const flag = await this.doctorFlagRepo.findOne({
      where: { flagCode: normalizedCode },
      relations: {
        patient: true,
        doctor: true,
      },
    });

    if (!flag) {
      throw new NotFoundException(
        `Doctor flag with code "${normalizedCode}" not found.`,
      );
    }

    return flag;
  }

  async resolveFlag(dto: ResolveDoctorFlagDto): Promise<DoctorFlag> {
    const flag = await this.findFlagByCode(dto.flagCode);

    if (flag.status === AlertStatus.RESOLVED) {
      throw new ConflictException(
        `Flag "${flag.flagCode}" has already been resolved.`,
      );
    }

    flag.status = AlertStatus.RESOLVED;
    flag.resolutionNotes = dto.notes ?? null;
    flag.resolvedAt = new Date();

    return await this.doctorFlagRepo.save(flag);
  }
}
