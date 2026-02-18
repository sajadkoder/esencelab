import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
  job_type: z.enum(['full-time', 'part-time', 'internship']).default('full-time'),
  status: z.enum(['active', 'closed', 'draft']).default('active')
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
