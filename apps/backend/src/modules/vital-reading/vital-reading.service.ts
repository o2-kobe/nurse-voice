import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { VitalReading } from './entities/vitalReading.entity';
import { CreateVitalReadingDto } from './dto/create-vital.dto';
import { PatientService } from '../patient/patient.service';

@Injectable()
export class VitalReadingService {
  constructor(
    @InjectRepository(VitalReading)
    private readonly vitalReadingRepository: Repository<VitalReading>,

    private readonly patientService: PatientService,
  ) {}

  async logVitalReading(dto: CreateVitalReadingDto): Promise<VitalReading> {
    const patient = await this.patientService.findPatientById(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate metric ranges
    if (dto.temperature < 30 || dto.temperature > 45) {
      throw new BadRequestException(
        'Temperature must be between 30°C and 45°C',
      );
    }
    if (
      dto.systolicBP < 0 ||
      dto.diastolicBP < 0 ||
      dto.systolicBP > 300 ||
      dto.diastolicBP > 200
    ) {
      throw new BadRequestException('Invalid blood pressure values');
    }

    // Handle speech-to-text decimal errors
    dto.temperature = parseFloat(dto.temperature.toFixed(2)); // Ensuring two decimal places

    // Create VitalReading entity
    const vitalReading = this.vitalReadingRepository.create({
      patient,
      systolicBP: dto.systolicBP,
      diastolicBP: dto.diastolicBP,
      temperature: dto.temperature,
      heartRate: dto.heartRate,
      recordedAt: new Date(),
    });

    // Save reading
    return await this.vitalReadingRepository.save(vitalReading);
  }
}
