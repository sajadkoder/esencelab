import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { User, AuthResponse } from '../types/index.js';
import { SignupInput, LoginInput } from '../validators/auth.validator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'esencelab-secret-key';

export class AuthService {
  static async signup(input: SignupInput): Promise<AuthResponse> {
    const { email, password, name, role } = input;

    // Use Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Signup failed');
    }

    // Get the profile (created by trigger)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const token = jwt.sign(
      { id: authData.user.id, email: authData.user.email!, role: role || 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { 
      user: profile || {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role: role || 'student',
      }, 
      token 
    };
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Use Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Login failed');
    }

    // Get the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const token = jwt.sign(
      { id: authData.user.id, email: authData.user.email!, role: profile?.role || 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { 
      user: profile || {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        role: authData.user.user_metadata?.role || 'student',
      }, 
      token 
    };
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as User;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data as User;
  }
}
