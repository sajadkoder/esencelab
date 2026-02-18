import { supabase } from '../config/supabase.js';
import { Candidate } from '../types/index.js';
import { UpdateCandidateStatusInput } from '../validators/candidates.validator.js';

export class CandidatesService {
  static async getAll(filters?: { status?: string; minScore?: number }): Promise<Candidate[]> {
    let query = supabase.from('candidates').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.minScore) {
      query = query.gte('match_score', filters.minScore);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    return data as Candidate[];
  }

  static async getById(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Candidate;
  }

  static async getByUserId(userId: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data as Candidate;
  }

  static async create(input: Partial<Candidate>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        ...input,
        status: input.status || 'new',
        match_score: input.match_score || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create candidate: ${error.message}`);
    }

    return data as Candidate;
  }

  static async updateStatus(id: string, input: UpdateCandidateStatusInput): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update({ status: input.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update candidate status: ${error.message}`);
    }

    return data as Candidate;
  }

  static async updateProfile(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update candidate: ${error.message}`);
    }

    return data as Candidate;
  }

  static async search(query: string): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .or(`name.ilike.%${query}%,role.ilike.%${query}%`);

    if (error) {
      throw new Error(`Failed to search candidates: ${error.message}`);
    }

    return data as Candidate[];
  }
}
