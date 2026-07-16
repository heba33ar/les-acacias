-- ============================================================
-- LES ACACIAS — espace admin (textes, photos, tarifs)
-- À coller tel quel dans Supabase : SQL Editor → New query → Run
--
-- Sécurité :
--   · tout le monde peut LIRE le contenu (c'est le site public) ;
--   · seul lesacacias30@gmail.com peut MODIFIER, une fois connecté
--     par lien magique. Si l'adresse admin change un jour,
--     remplacez-la aux 4 endroits ci-dessous et relancez ce script.
-- ============================================================

-- Le contenu modifiable du site : 3 lignes (texts, photos, prices)
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

drop policy if exists "contenu lecture publique" on site_content;
create policy "contenu lecture publique" on site_content
  for select using (true);

drop policy if exists "contenu ecriture admin" on site_content;
create policy "contenu ecriture admin" on site_content
  for all
  using (auth.jwt()->>'email' = 'lesacacias30@gmail.com')
  with check (auth.jwt()->>'email' = 'lesacacias30@gmail.com');

-- Le stockage des photos envoyées depuis l'admin
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos lecture publique" on storage.objects;
create policy "photos lecture publique" on storage.objects
  for select using (bucket_id = 'photos');

drop policy if exists "photos ajout admin" on storage.objects;
create policy "photos ajout admin" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.jwt()->>'email' = 'lesacacias30@gmail.com');

drop policy if exists "photos suppression admin" on storage.objects;
create policy "photos suppression admin" on storage.objects
  for delete using (bucket_id = 'photos' and auth.jwt()->>'email' = 'lesacacias30@gmail.com');
