-- Materialhub: Datenbank-Schema
-- Einmalig im Supabase-Dashboard unter "SQL Editor" ausführen.

create extension if not exists pgcrypto;

create table if not exists public.materials (
  id          uuid primary key default gen_random_uuid(),
  titel       text not null,
  url         text not null default '',
  faecher     text[] not null default '{}',   -- deutsch, religion, geschichte, wipo, mathe, ueber
  klassen     text[] not null default '{}',   -- 5 … 10, E, Q1, Q2; leer = alle Jahrgänge
  thema       text not null default '',
  typ         text not null default 'Spiel',
  dauer       text not null default '',
  kurz        text not null default '',
  wie         text not null default '',
  ablauf      text not null default '',       -- ein Schritt pro Zeile
  zugang      jsonb not null default '[]',    -- [{"label":"Code","wert":"2412"}, …]
  spick_path  text not null default '',
  spick_name  text not null default '',
  bild_path   text not null default '',
  pruefen     boolean not null default false,
  autor       text not null default '',
  updated_by  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Zugriff nur über die Server-Funktionen des Hubs (geheimer Schlüssel).
-- Ohne Policies kann der öffentliche Schlüssel nichts lesen oder schreiben.
alter table public.materials enable row level security;

-- Privater Speicher für Spickzettel und Vorschaubilder
insert into storage.buckets (id, name, public)
values ('hub-dateien', 'hub-dateien', false)
on conflict (id) do nothing;
