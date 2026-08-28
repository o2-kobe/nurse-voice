import { z } from 'zod';
import { PatientGender } from '../entities/patient.entity';

// Find Patient By Code Schema
export const findPatientByCodeSchema = z.object({
  patientCode: z
    .string()
    .describe('The unique patient code starting with PAT- (e.g., PAT-8X2K9)'),
});

export type FindPatientByCodeInput = z.infer<typeof findPatientByCodeSchema>;

// Create Patient Schema
export const createPatientSchema = z.object({
  firstName: z.string().describe('The first name of the patient'),
  lastName: z.string().describe('The last name or surname of the patient'),
  age: z.number().min(1).describe('The age of the patient'),
  gender: z.enum(PatientGender).describe('Acceptable gender types of patients'),
  ward: z.string().describe('The ward of the patient'),
  bedNumber: z
    .string()
    .optional()
    .describe('The bed number of the bed assigned to the patient'),
  assignedDoctorCode: z
    .string()
    .optional()
    .describe(
      'The unique doctor code of the doctor being assigned to the patient starting with DOC- (eg. DOC-83YHX)',
    ),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
