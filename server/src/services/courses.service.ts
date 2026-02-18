import { supabase } from '../config/supabase.js';
import { Course } from '../types/index.js';

export class CoursesService {
  static async getAll(filters?: { level?: string; skill?: string }): Promise<Course[]> {
    let query = supabase.from('courses').select('*');

    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.skill) {
      query = query.contains('skills', [filters.skill]);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data as Course[];
  }

  static async getById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Course;
  }

  static async create(input: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }

    return data as Course;
  }

  static async getRecommended(skills: string[]): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .overlaps('skills', skills)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch recommended courses: ${error.message}`);
    }

    return data as Course[];
  }
}
