-- =============================================================================
-- Premium gap engine data layer — two SECURITY DEFINER RPCs that feed the
-- "Your Gaps, Explained" panel on the corporate (Premium) dashboard.
--
-- WHY SECURITY DEFINER: org_classification and workforce_intelligence_responses_new
-- are RLS-locked. These functions run with the definer's privileges so the
-- signed-in (authenticated) client can read ONLY:
--   (1) get_my_workforce_response()      -> the caller's OWN answers, matched by
--                                           their account email. Never anyone
--                                           else's rows.
--   (2) get_workforce_peer_distribution() -> per-answer peer shares as
--                                           count(distinct response_ref), with a
--                                           hard anonymity floor of 5 distinct
--                                           organizations and lens-widening. Never
--                                           returns any organization identifier.
-- Neither is granted to anon.
--
-- -----------------------------------------------------------------------------
-- !! CONFIRM BEFORE RUNNING — these identifiers cannot be read from the app repo
--    (the other RPC bodies live only in Supabase). Adjust the two placeholders to
--    match exactly what the existing get_premium_* / get_public_flagship_stats
--    functions already use for the current Global Workforce Deployment 2026 wave:
--
--   (1) <<RESPONSES_VIEW>>  the response-level view/table exposing: response_ref,
--                           q_code, question_label, answer_option, industry_group,
--                           region_group, size_band, and the wave selector columns.
--                           The flagship RPC calls this v_responses.
--   (2) <<WAVE_SELECTOR>>   the predicate scoping to the current wave — the SAME
--                           literals get_premium_breakdown uses, e.g.
--                             report_name = 'Global Workforce Deployment' AND source_year = 2026
--                           (or report_name = 'Global Workforce Deployment 2026').
--
--   Also confirm org_classification exposes: email, response_ref.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1) The caller's OWN response rows (long format: one row per answer option).
--    Identity comes from the JWT email, matched case-insensitively to
--    org_classification.email. Returns zero rows when the account has no linked
--    contribution — the panel then shows its empty state.
-- -----------------------------------------------------------------------------
create or replace function public.get_my_workforce_response()
returns table (
  response_ref   text,
  region_group   text,
  industry_group text,
  size_band      text,
  q_code         text,
  question_label text,
  answer_option  text
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select lower(btrim(coalesce(auth.jwt() ->> 'email', ''))) as email
  ),
  refs as (
    select distinct oc.response_ref
    from public.org_classification oc, me
    where me.email <> ''
      and lower(btrim(oc.email)) = me.email
      and oc.response_ref is not null
  )
  select
    r.response_ref,
    r.region_group,
    r.industry_group,
    r.size_band,
    r.q_code,
    r.question_label,
    r.answer_option
  from <<RESPONSES_VIEW>> r
  join refs on refs.response_ref = r.response_ref
  where <<WAVE_SELECTOR>>;
$$;

-- Per-user data: authenticated only, never anon.
revoke all on function public.get_my_workforce_response() from public;
grant execute on function public.get_my_workforce_response() to authenticated;


-- -----------------------------------------------------------------------------
-- 2) Peer distribution per question, with the anonymity floor + lens widening.
--    For EVERY q_code in the wave, the share of each answer_option is computed at
--    the NARROWEST lens whose distinct-respondent base is >= 5:
--        industry_group  ->  region_group  ->  market-wide
--    peer_level / peer_label record which lens was actually used so the UI can
--    say "vs the wider market" when it had to widen. A comparison built on fewer
--    than 5 organizations is never returned.
--
--    size_band is accepted for parity with the caller's segments but is not part
--    of the widening chain (the floor path is industry -> region -> market).
-- -----------------------------------------------------------------------------
create or replace function public.get_workforce_peer_distribution(
  p_industry text,
  p_region   text,
  p_size     text default null
)
returns table (
  q_code         text,
  question_label text,
  answer_option  text,
  respondents    bigint,
  base_n         bigint,
  peer_level     text,
  peer_label     text
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      r.response_ref,
      r.q_code,
      r.question_label,
      r.answer_option,
      r.industry_group,
      r.region_group
    from <<RESPONSES_VIEW>> r
    where <<WAVE_SELECTOR>>
  ),
  -- distinct-respondent base per q_code at each lens
  lvl as (
    select 'industry'::text as lvl, 1 as pri, b.q_code,
           count(distinct b.response_ref) as base_n
    from base b
    where p_industry is not null and b.industry_group = p_industry
    group by b.q_code
    union all
    select 'region', 2, b.q_code, count(distinct b.response_ref)
    from base b
    where p_region is not null and b.region_group = p_region
    group by b.q_code
    union all
    select 'market', 3, b.q_code, count(distinct b.response_ref)
    from base b
    group by b.q_code
  ),
  -- narrowest lens with base >= 5, per q_code
  chosen as (
    select distinct on (l.q_code) l.q_code, l.lvl, l.base_n
    from lvl l
    where l.base_n >= 5
    order by l.q_code, l.pri
  ),
  dist as (
    select
      c.q_code,
      max(b.question_label) as question_label,
      b.answer_option,
      count(distinct b.response_ref) as respondents,
      c.base_n,
      c.lvl as peer_level
    from chosen c
    join base b
      on b.q_code = c.q_code
     and (
          (c.lvl = 'industry' and b.industry_group = p_industry)
       or (c.lvl = 'region'   and b.region_group   = p_region)
       or (c.lvl = 'market')
     )
    group by c.q_code, b.answer_option, c.base_n, c.lvl
  )
  select
    d.q_code,
    d.question_label,
    d.answer_option,
    d.respondents,
    d.base_n,
    d.peer_level,
    case d.peer_level
      when 'industry' then coalesce(nullif(p_industry, ''), 'your industry') || ' organizations'
      when 'region'   then 'organizations in ' || coalesce(nullif(p_region, ''), 'your region')
      else 'the wider market'
    end as peer_label
  from dist d
  order by d.q_code, d.respondents desc;
$$;

revoke all on function public.get_workforce_peer_distribution(text, text, text) from public;
grant execute on function public.get_workforce_peer_distribution(text, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- VERIFY (run as an authenticated user, or impersonate one):
--   select * from public.get_my_workforce_response();
--   select * from public.get_workforce_peer_distribution('Technology', 'Europe (Inc. UK & Ireland)', null)
--     order by q_code, respondents desc;
-- Every returned base_n must be >= 5. Any q_code that comes back only at
-- peer_level = 'market' had fewer than 5 organizations at the narrower lenses.
-- -----------------------------------------------------------------------------
