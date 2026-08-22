import { z } from 'zod';

export const findPatientByCodeSchema = z.object({
  patientCode: z
    .string()
    .describe('The unique patient code starting with PAT- (e.g., PAT-8X2K9)'),
});

export type FindPatientByCodeInput = z.infer<typeof findPatientByCodeSchema>;
