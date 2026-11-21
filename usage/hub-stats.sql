-- Romy's Projects Hub : statistiques d'usage AGRÉGÉES pour une base Supabase.
-- Ne renvoie que des totaux et des dates (nombre de lignes par table, lignes par jour,
-- nombre d'utilisateurs inscrits et actifs). Aucune donnée personnelle : ni noms, ni e-mails, ni contenus.
--
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
-- Remplacez REMPLACEZ_PAR_VOTRE_CLE par la clé affichée dans le hub (bouton « Connecter l'usage »).

create table if not exists public.hub_config (name text primary key, value text not null);
alter table public.hub_config enable row level security;   -- aucune règle : la table est invisible pour anon et authenticated
insert into public.hub_config (name, value) values ('key', 'REMPLACEZ_PAR_VOTRE_CLE')
  on conflict (name) do update set value = excluded.value;

create or replace function public.hub_stats(p_key text) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  stored text; t record; col text; n bigint; x jsonb; r jsonb; tabs jsonb := '[]'::jsonb; au jsonb := null;
begin
  select value into stored from public.hub_config where name = 'key';
  if stored is null or p_key is null or p_key <> stored then raise exception 'forbidden'; end if;

  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
      and table_name not in ('hub_config', 'admins', 'settings', 'app_settings')
  loop
    -- colonne de date la plus parlante : created_at, inserted_at, submitted_at…
    select column_name into col from information_schema.columns
      where table_schema = 'public' and table_name = t.table_name
        and data_type in ('timestamp with time zone', 'timestamp without time zone', 'date')
      order by array_position(array['created_at','inserted_at','submitted_at','created','date','updated_at'], column_name::text) nulls last, ordinal_position
      limit 1;
    execute format('select count(*) from public.%I', t.table_name) into n;
    r := jsonb_build_object('name', t.table_name, 'rows', n, 'bytes', pg_total_relation_size(format('public.%I', t.table_name)::regclass));
    if col is not null then
      execute format($f$select jsonb_build_object('n7', count(*) filter (where %1$I >= now() - interval '7 days'),
                                                   'n30', count(*) filter (where %1$I >= now() - interval '30 days'),
                                                   'last', max(%1$I)) from public.%2$I$f$, col, t.table_name) into x;
      r := r || x;
      execute format($f$select coalesce(jsonb_object_agg(d, c), '{}'::jsonb)
                        from (select (%1$I)::date::text d, count(*) c from public.%2$I where %1$I >= current_date - 83 group by 1) s$f$, col, t.table_name) into x;
      r := r || jsonb_build_object('days', x);
    end if;
    tabs := tabs || jsonb_build_array(r);
  end loop;

  if to_regclass('auth.users') is not null then
    select jsonb_build_object('users', count(*),
                              'active7', count(*) filter (where last_sign_in_at >= now() - interval '7 days'),
                              'active30', count(*) filter (where last_sign_in_at >= now() - interval '30 days'),
                              'last_seen', max(last_sign_in_at)) into au from auth.users;
    au := au || jsonb_build_object(
      'created', (select coalesce(jsonb_object_agg(d, c), '{}'::jsonb) from (select created_at::date::text d, count(*) c from auth.users where created_at >= current_date - 83 group by 1) s),
      'seen',    (select coalesce(jsonb_object_agg(d, c), '{}'::jsonb) from (select last_sign_in_at::date::text d, count(*) c from auth.users where last_sign_in_at >= current_date - 83 group by 1) s));
  end if;

  return jsonb_build_object('db_bytes', pg_database_size(current_database()), 'tables', tabs, 'auth', au);
end $$;

-- appelable avec la clé publique du site, mais ne répond qu'avec la bonne clé de lecture
revoke all on function public.hub_stats(text) from public;
grant execute on function public.hub_stats(text) to anon, authenticated;
