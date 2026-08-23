import { Body, Controller, Post } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  CreatePatientDto(@Body() dto: CreatePatientDto) {
    return this.patientService.createPatient(dto);
  }
}
