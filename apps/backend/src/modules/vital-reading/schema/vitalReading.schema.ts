import { z } from 'zod';

export const logVitalsSchema = z.object({
  patientCode: z.string().describe('The PAT code of the patient'),
  heartRate: z.number().describe('BPM of the patient'),
  systolicBP: z.number().describe('Systolic blood pressure of the patient'),
  diastolicBP: z.number().describe('Diastolic blood pressure of the patient'),
  temperature: z
    .number()
    .describe('Body temperature in Celsius or Fahrenheit of the patient'),
});

export type LogVitalsSchemaInput = z.infer<typeof logVitalsSchema>;
