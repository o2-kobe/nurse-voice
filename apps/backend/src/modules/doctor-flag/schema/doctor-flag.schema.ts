import z from 'zod';
import { UrgencyLevel } from '../entities/doctor-flag.entity';

export const createDoctorFlagSchema = z.object({
  patientCode: z
    .string()
    .describe('The unique code of the patient related to the doctor flag'),
  doctorCode: z
    .string()
    .describe('The unique code of the doctor related to the doctor flag'),
  urgency: z
    .enum(UrgencyLevel)
    .describe('The urgency level of the doctor flag'),
  reason: z.string().describe('The reason for the raised doctor flag'),
});

export type createDoctorFlagInput = z.infer<typeof createDoctorFlagSchema>;
