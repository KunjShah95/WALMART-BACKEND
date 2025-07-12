import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for regular operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for service role operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database operations
export class DatabaseService {
  static async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async saveDesign(designData) {
    const { data, error } = await supabase
      .from('designs')
      .insert([designData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async saveMaterialScore(scoreData) {
    const { data, error } = await supabase
      .from('material_scores')
      .insert([scoreData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        designs(*),
        material_scores(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}