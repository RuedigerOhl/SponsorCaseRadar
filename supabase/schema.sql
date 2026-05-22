-- SpotCase Database Schema
-- Run this in your Supabase SQL editor

create table if not exists cases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  brand text,
  partner text,
  category text,
  photo_url text,
  description_input text,
  summary text,
  discovered_by text,
  score_total numeric,
  score_label text,
  ratings jsonb,
  strategic_insight text,
  sources text[]
);

-- Enable Row Level Security
alter table cases enable row level security;

-- Allow public read access
create policy "Public can read cases"
  on cases for select
  using (true);

-- Allow public insert (API route uses service role key)
create policy "Service role can insert cases"
  on cases for insert
  with check (true);

-- Create storage bucket for case images
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;

-- Allow public read of images
create policy "Public can view case images"
  on storage.objects for select
  using (bucket_id = 'case-images');

-- Allow uploads via service role
create policy "Service role can upload case images"
  on storage.objects for insert
  with check (bucket_id = 'case-images');

-- Index for faster queries
create index if not exists cases_created_at_idx on cases (created_at desc);
create index if not exists cases_score_label_idx on cases (score_label);
create index if not exists cases_category_idx on cases (category);
