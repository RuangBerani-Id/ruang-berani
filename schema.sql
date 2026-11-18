-- Jalankan di Supabase SQL Editor. Lalu buat akun staf di Auth > Users dan:
-- insert into staff(user_id) values ('<UUID-akun-staf>');
create table stories(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  anonymous boolean not null,
  is_minor boolean not null default false,
  name text, school text, contact text, title text,
  body text not null,
  consent_storage boolean not null,
  consent_adaptation boolean not null default false,
  consent_publication boolean not null default false,
  consent_guardian boolean not null default false,
  status text not null default 'baru',
  check (consent_storage),
  check (not anonymous or (name is null and school is null)),
  check (anonymous or name is not null),
  check (anonymous or not is_minor or consent_guardian)
);
create table staff(user_id uuid primary key references auth.users on delete cascade);
create table posts(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null, body text, image_url text,
  published boolean not null default false
);
alter table stories enable row level security;
alter table staff enable row level security;
alter table posts enable row level security;
create function is_staff() returns boolean language sql security definer stable
as $$ select exists(select 1 from staff where user_id = auth.uid()) $$;
revoke all on stories from anon;
grant insert on stories to anon;
create policy "kirim cerita" on stories for insert to anon, authenticated with check (true);
create policy "staf baca" on stories for select to authenticated using (is_staff());
create policy "staf ubah" on stories for update to authenticated using (is_staff());
create policy "staf hapus" on stories for delete to authenticated using (is_staff());
create policy "cek diri" on staff for select to authenticated using (user_id = auth.uid());
create policy "publik baca" on posts for select using (published);
create policy "staf kelola" on posts for all to authenticated using (is_staff()) with check (is_staff());
