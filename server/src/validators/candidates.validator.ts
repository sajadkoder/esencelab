import { z } from 'zod';

export const updateCandidateStatusSchema = z.object({
  status: z.enum(['new', 'screening', 'interview', 'hired', 'rejected'])
});

export type UpdateCandidateStatusInput = z.infer<typeof updateCandidateStatusSchema>;
