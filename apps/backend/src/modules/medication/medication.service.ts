import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from './entities/medication.entity';
import { PatientService } from '../patient/patient.service';
import { CreateMedicationDto } from './dto/create-medication.dto';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,

    private readonly patientService: PatientService,
  ) {}

  async logMedication(
    patientId: string,
    dto: CreateMedicationDto,
  ): Promise<Medication> {
    const patient = await this.patientService.findPatientById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Handle unitless dosage strings
    if (!dto.dosage.includes('mg') && !dto.dosage.includes('g')) {
      throw new BadRequestException(
        'Dosage must include units (e.g., "500mg", "1g")',
      );
    }

    // Check for duplicate command execution in the same minute
    const currentTime = new Date();
    const oneMinuteAgo = new Date(currentTime.getTime() - 60000); // 1 minute ago
    const existingLog = await this.medicationRepository.findOne({
      where: {
        patient,
        administeredAt: Between(oneMinuteAgo, currentTime),
      },
    });

    if (existingLog) {
      throw new BadRequestException(
        'Duplicate medication log detected within the same minute',
      );
    }

    // Create Medication entity
    const medication = this.medicationRepository.create({
      patient,
      medicationName: dto.medicationName,
      dosage: dto.dosage,
      administeredAt: new Date(),
    });

    return await this.medicationRepository.save(medication);
  }
}
