import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed, BedStatus } from './entities/bed.entity';
import {
  CreateBedDto,
  FindWardBedDto,
  GetAvailableBedsDto,
  GetBedDto,
} from './dto/bed.dto';

@Injectable()
export class BedService {
  constructor(
    @InjectRepository(Bed) private readonly bedRepository: Repository<Bed>,
  ) {}

  async createBed(dto: CreateBedDto): Promise<Bed> {
    return this.bedRepository.save(this.bedRepository.create(dto));
  }

  async findBedByNumber(dto: GetBedDto): Promise<Bed> {
    const bed = await this.bedRepository.findOneBy({
      bedNumber: dto.bedNumber,
    });

    if (!bed) {
      throw new NotFoundException(
        `Bed with bed number ${dto.bedNumber} not found.`,
      );
    }

    return bed;
  }

  async assignPatientBed(bedId: string, patientId: string): Promise<void> {
    const result = await this.bedRepository.update(
      { id: bedId },
      { currentPatient: { id: patientId } },
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Bed with ID ${bedId} not found.`);
    }
  }

  async removePatientFromBed(bedId: string): Promise<Bed> {
    const bed = await this.bedRepository.findOneBy({ id: bedId });

    if (!bed) {
      throw new NotFoundException(`Bed with ID ${bedId} not found.`);
    }

    if (!bed.currentPatient) {
      throw new BadRequestException(
        `Bed with ID ${bedId} does not have a patient assigned.`,
      );
    }

    bed.currentPatient = null;
    bed.status = BedStatus.AVAILABLE;

    return this.bedRepository.save(bed);
  }

  async getAvailableBeds(dto: GetAvailableBedsDto): Promise<Bed[]> {
    return await this.bedRepository.find({
      where: { status: BedStatus.AVAILABLE, ward: dto.ward },
    });
  }

  async findBedInWard(dto: FindWardBedDto): Promise<Bed> {
    const normalizedWard = dto.ward.trim();
    const normalizedBed = dto.bedNumber.trim();

    const bed = await this.bedRepository.findOne({
      where: { ward: normalizedWard, bedNumber: normalizedBed },
      relations: { currentPatient: true },
    });

    if (!bed) {
      throw new NotFoundException(
        `Bed "${normalizedBed}" in "${normalizedWard}" does not exist in the hospital setup.`,
      );
    }

    return bed;
  }
}
