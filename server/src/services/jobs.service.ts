import { supabase } from '../config/supabase.js';
import { Job, Application, Candidate } from '../types/index.js';
import { CreateJobInput, UpdateJobInput } from '../validators/jobs.validator.js';

export class JobsService {
  static async getAll(filters?: { status?: string; location?: string }): Promise<Job[]> {
    let query = supabase.from('jobs').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await query.order('posted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    return data as Job[];
  }

  static async getById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Job;
  }

  static async create(employerId: string, input: CreateJobInput): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        employer_id: employerId,
        ...input,
        posted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return data as Job;
  }

  static async update(id: string, input: UpdateJobInput): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return data as Job;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  static async getApplications(jobId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        candidates (*)
      `)
      .eq('job_id', jobId);

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return data as Application[];
  }

  static async getJobsByEmployer(employerId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .order('posted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch employer jobs: ${error.message}`);
    }

    return data as Job[];
  }
}
