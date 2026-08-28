import { Module } from '@nestjs/common';
import { NurseAgentController } from './nurse-agent.controller';
import { NurseAgentService } from './nurse-agent.service';
import { NurseAgentToolsService } from './nurse-agent-tools.service';
import { PatientModule } from '../patient/patient.module';
import { VitalReadingModule } from '../vital-reading/vital-reading.module';

@Module({
  imports: [PatientModule, VitalReadingModule],
  controllers: [NurseAgentController],
  providers: [NurseAgentService, NurseAgentToolsService],
})
export class NurseAgentModule {}
