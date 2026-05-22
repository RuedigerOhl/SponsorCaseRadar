import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
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

export interface RatingReasons {
  kreative_idee: string;
  strategischer_fit: string;
  visibility: string;
  multichannel: string;
  talk_of_town: string;
  aktivierungsmechanik: string;
  impact: string;
  nachhaltigkeit: string;
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
  rating_reasons: RatingReasons | null;
  strategic_insight: string | null;
  sources: string[] | null;
}
