-- EchoCampus
-- Tables + Relations (code-aligned)
-- Last updated: 2026-03-24
--
-- This file defines structural schema required by:
-- - app/api/*
-- - app/auth/login/*
-- - app/main/* profile pages
-- - src/components/* (announcements, complaints, marketplace, lost_found, directory)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'student' check (role in ('student', 'faculty', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- STUDENT PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.student_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  session_code text unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FACULTY PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.faculty_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  department text,
  phone_no text,
  cabin_no text,
  experience_years integer check (experience_years >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- DIRECTORY
-- ---------------------------------------------------------------------------
create table if not exists public.directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  experience integer check (experience >= 0),
  department text not null,
  phone_no text,
  date_of_birth date,
  cabin_no text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FACULTY USER MAPPING
-- ---------------------------------------------------------------------------
create table if not exists public.faculty_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  faculty_id uuid unique not null references public.directory(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- author_id -> directory.id (used by AnnouncementList join)
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.directory(id) on delete restrict,
  title text not null,
  link text,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------------
create table if not exists public.complaint_box (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_upvotes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaint_box(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (complaint_id, user_id)
);

-- ---------------------------------------------------------------------------
-- MARKETPLACE
-- ---------------------------------------------------------------------------
create table if not exists public.marketplace (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  owner_name text not null,
  owner_email text not null,
  product_title text not null,
  description text not null,
  price numeric not null check (price > 0 and price <= 99999),
  contact_info text not null check (contact_info ~ '^[0-9]{10}$'),
  is_sold boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- LOST + FOUND
-- ---------------------------------------------------------------------------
create table if not exists public.lost_found (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  location_found text not null,
  contact_info text not null,
  image_url text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES (query-aligned)
-- ---------------------------------------------------------------------------
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_student_profiles_session_code on public.student_profiles(session_code);
create index if not exists idx_faculty_profiles_department on public.faculty_profiles(department);
create index if not exists idx_directory_name on public.directory(name);
create index if not exists idx_directory_department on public.directory(department);
create index if not exists idx_announcements_created_at on public.announcements(created_at desc);
create index if not exists idx_announcements_author on public.announcements(author_id);
create index if not exists idx_complaint_box_created_at on public.complaint_box(created_at desc);
create index if not exists idx_complaint_box_user on public.complaint_box(user_id);
create index if not exists idx_complaint_upvotes_complaint on public.complaint_upvotes(complaint_id);
create index if not exists idx_complaint_upvotes_user on public.complaint_upvotes(user_id);
create index if not exists idx_marketplace_created_at on public.marketplace(created_at desc);
create index if not exists idx_marketplace_owner on public.marketplace(owner_id);
create index if not exists idx_marketplace_is_sold on public.marketplace(is_sold);
create index if not exists idx_lost_found_created_at on public.lost_found(created_at desc);
create index if not exists idx_lost_found_user on public.lost_found(user_id);

