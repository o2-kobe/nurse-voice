import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { PatientService } from '../patient/patient.service';
import {
  FindPatientByCodeInput,
  findPatientByCodeSchema,
} from '../patient/schema/patient.schema';
// import { VitalReadingService } from '../vital-reading/vital-reading.service';
// import { DoctorFlagService } from '../doctor-flag/doctor-flag.service';

@Injectable()
export class NurseAgentToolsService {
  constructor(
    private readonly patientService: PatientService,
    // private readonly vitalReadingService: VitalReadingService,
    // private readonly doctorFlagService: DoctorFlagService,
  ) {}

  getTools() {
    return {
      findPatientByCode: tool({
        description:
          'Look up patient details using their unique PAT code (e.g., PAT-8X2K9). Use this whenever a nurse mentions a patient code or asks about a patient.',

        inputSchema: findPatientByCodeSchema,

        execute: async ({ patientCode }: FindPatientByCodeInput) => {
          try {
            const patient = await this.patientService.findByCode(patientCode);

            return { success: true, patient };
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message ||
                  `Patient with code ${patientCode} was not found.`
                : 'An unexpected error occurred';
            return { success: false, message: errorMessage };
          }
        },
      }),

      // logVitalReading: tool({
      //   description:
      //     'Log vital signs (heart rate, blood pressure, temperature, etc.) for a specific patient.',
      //   inputSchema: z.object({
      //     patientCode: z.string().describe('The PAT code of the patient'),
      //     heartRate: z.number().optional().describe('BPM'),
      //     systolicBp: z.number().optional().describe('Systolic blood pressure'),
      //     diastolicBp: z
      //       .number()
      //       .optional()
      //       .describe('Diastolic blood pressure'),
      //     temperature: z
      //       .number()
      //       .optional()
      //       .describe('Body temperature in Celsius or Fahrenheit'),
      //   }),
      //   execute: async (vitalsData) => {
      //     try {
      //       const record =
      //         await this.vitalReadingService.logVitalReading(vitalsData);

      //       return { success: true, record };
      //     } catch (error) {
      //       const errorMessage =
      //         error instanceof Error
      //           ? error.message
      //           : 'An unexpected error occurred';
      //       return { success: false, message: errorMessage };
      //     }
      //   },
      // }),

      // createDoctorFlag: tool({
      //   description:
      //     'Raise an alert/flag for a doctor regarding a patient status or critical issue.',
      //   inputSchema: z.object({
      //     patientCode: z.string().describe('The PAT code of the patient'),
      //     reason: z
      //       .string()
      //       .describe('Detailed reason for flagging the doctor'),
      //     urgency: z
      //       .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      //       .describe('Urgency level'),
      //   }),
      //   execute: async (flagData) => {
      //     try {
      //       const flag =
      //         await this.doctorFlagService.createDoctorFlag(flagData);

      //       return { success: true, flag };
      //     } catch (error) {
      //       const errorMessage =
      //         error instanceof Error
      //           ? error.message
      //           : 'An unexpected error occurred';
      //       return { success: false, message: errorMessage };
      //     }
      //   },
      // }),
    };
  }
}
