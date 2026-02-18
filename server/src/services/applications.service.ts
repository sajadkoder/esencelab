import { supabase } from '../config/supabase.js';
import { Application } from '../types/index.js';

export class ApplicationsService {
  static async getByUserId(userId: string): Promise<Application[]> {
    const { data: candidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!candidate) return [];

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (*)
      `)
      .eq('candidate_id', candidate.id)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return data as Application[];
  }

  static async create(candidateId: string, jobId: string): Promise<Application> {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .single();

    if (existing) {
      throw new Error('Already applied to this job');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        candidate_id: candidateId,
        job_id: jobId,
        status: 'pending',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }

    return data as Application;
  }

  static async updateStatus(id: string, status: Application['status']): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }

    return data as Application;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }
}
