import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client (for client-side use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (for API routes)
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface Case {
  id: string;
  created_at: string;
  title: string;
  brand: string | null;
  partner: string | null;
  category: string | null;
  photo_url: string | null;
  description_input: string | null;
  summary: string | null;
  discovered_by: string | null;
  score_total: number | null;
  score_label: string | null;
  ratings: Ratings | null;
  strategic_insight: string | null;
  sources: string[] | null;
}

export interface Ratings {
  kreative_idee: number;
  strategischer_fit: number;
  visibility: number;
  multichannel: number;
  talk_of_town: number;
  aktivierungsmechanik: number;
  impact: number;
  nachhaltigkeit: number;
}
