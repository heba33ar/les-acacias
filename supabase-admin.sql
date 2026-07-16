-- ============================================================
-- LES ACACIAS — espace admin (textes, photos, tarifs)
-- À coller tel quel dans Supabase : SQL Editor → New query → Run
-- Ce script peut être relancé sans risque (il remplace les règles).
--
-- Sécurité :
--   · tout le monde peut LIRE le contenu (c'est le site public) ;
--   · seules les adresses de la fonction is_site_admin() peuvent
--     MODIFIER, une fois connectées par lien magique.
--
-- POUR AJOUTER OU RETIRER UN ADMIN :
--   1. modifiez la liste dans la fonction is_site_admin() ci-dessous,
--      puis relancez tout ce script (Run) ;
--   2. créez aussi le compte : Authentication → Users → Add user
--      (avec « Auto Confirm User »), car les inscriptions sont fermées.
--   Les deux étapes sont nécessaires.
-- ============================================================

-- La liste des adresses autorisées à modifier le site :
create or replace function is_site_admin() returns boolean
language sql stable as $$
  select auth.jwt()->>'email' in (
    'lesacacias30@gmail.com',
    'heba33.ar@gmail.com'
    -- , 'autre-admin@exemple.fr'   ← ajoutez ici, virgule au début
  );
$$;

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
  using (is_site_admin())
  with check (is_site_admin());

-- Le stockage des photos envoyées depuis l'admin
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos lecture publique" on storage.objects;
create policy "photos lecture publique" on storage.objects
  for select using (bucket_id = 'photos');

drop policy if exists "photos ajout admin" on storage.objects;
create policy "photos ajout admin" on storage.objects
  for insert with check (bucket_id = 'photos' and is_site_admin());

drop policy if exists "photos suppression admin" on storage.objects;
create policy "photos suppression admin" on storage.objects
  for delete using (bucket_id = 'photos' and is_site_admin());
