-- =============================================================================
-- Vendor dashboard — per-cohort results for questions with option-list versions
-- First (and currently only) case: function_resource_change (Q15).
--
-- WHY: Q15 pools two incompatible option-list versions of the same question:
--   * Occurrence  vocabulary: Yes / No / Unsure
--   * Direction   vocabulary: Increased / Decreased / Stayed the same
-- These measure different things (occurrence vs direction) and must never be
-- merged. This function returns one row per cohort per answer, each cohort with
-- its OWN base = count(distinct response_ref) within the cohort, and percentages
-- taken against that cohort's own base.
--
-- Contract (one row per cohort per answer):
--   cohort_label       text     -- 'Occurrence' | 'Direction'
--   answer_option      text     -- stored answer_option, UNCHANGED (join key)
--   respondent_count   bigint   -- count(distinct response_ref) for the answer
--   pct_within_cohort  numeric  -- 100 * respondent_count / cohort_base_n
--   cohort_base_n      bigint   -- count(distinct response_ref) within the cohort
--
-- The display renders one panel per cohort, each with its own question-wording
-- subtitle and its own n. No pooled numbers anywhere on the card.
--
-- -----------------------------------------------------------------------------
-- !! CONFIRM BEFORE RUNNING — three identifiers cannot be read from the app repo
--    (the RPC bodies live only in Supabase; this environment has no service-role
--    DB access). Adjust the three tokens below to match your existing objects,
--    keeping them identical to what get_vendor_commercial_current already uses:
--
--   (1) <<FACT_TABLE>>        the response-level fact table/view that carries
--                             question_key, answer_option, response_ref,
--                             report_name, source_year. Replace every
--                             occurrence below.
--   (2) <<VENDOR_TIER_GATE>>  the exact vendor-tier check predicate/helper used
--                             by the other get_vendor_* SECURITY DEFINER
--                             functions (e.g. a has_vendor_access() helper, or
--                             an inline check against your profile/tier table).
--   (3) <<CURRENT_REPORT>> /  the current-wave selectors so the
--       <<CURRENT_YEAR>>      (question_key, report_name, source_year) index is
--                             used — same literals get_vendor_commercial_current
--                             uses for the current 2026 wave.
-- =============================================================================

create or replace function public.get_vendor_q15_cohorts()
returns table (
  cohort_label      text,
  answer_option     text,
  respondent_count  bigint,
  pct_within_cohort numeric,
  cohort_base_n     bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- ---- GATE: vendor-tier check (same pattern as other get_vendor_* RPCs) ----
  -- Replace the condition with your existing vendor-tier predicate/helper.
  if not (<<VENDOR_TIER_GATE>>) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  with src as (
    -- Filter on question_key (+ current wave) so the
    -- (question_key, report_name, source_year) index is used.
    -- nullif(<filter>, 'All') empty-filter handling belongs here if/when this
    -- function is made filter-aware; the current wave has no user filters.
    select
      f.answer_option                              as answer_option,
      f.response_ref                               as response_ref,
      case
        when lower(btrim(f.answer_option)) in ('yes', 'no', 'unsure')
          then 'Occurrence'
        when lower(btrim(f.answer_option)) in ('increased', 'decreased', 'stayed the same')
          then 'Direction'
        else null
      end                                          as cohort_label
    from <<FACT_TABLE>> f
    where f.question_key = 'function_resource_change'
      and f.report_name  = <<CURRENT_REPORT>>
      and f.source_year  = <<CURRENT_YEAR>>
  ),
  scoped as (
    -- Drop any answer_option outside the two known cohorts (never merge them).
    select * from src where cohort_label is not null
  ),
  bases as (
    select
      s.cohort_label,
      count(distinct s.response_ref) as cohort_base_n
    from scoped s
    group by s.cohort_label
  ),
  per_answer as (
    select
      s.cohort_label,
      s.answer_option,
      count(distinct s.response_ref) as respondent_count
    from scoped s
    group by s.cohort_label, s.answer_option
  )
  select
    pa.cohort_label,
    pa.answer_option,
    pa.respondent_count,
    round(100.0 * pa.respondent_count / nullif(b.cohort_base_n, 0), 1) as pct_within_cohort,
    b.cohort_base_n
  from per_answer pa
  join bases b using (cohort_label)
  order by
    -- Occurrence panel first, then Direction; answers by descending share.
    case pa.cohort_label when 'Occurrence' then 0 when 'Direction' then 1 else 2 end,
    pa.respondent_count desc,
    pa.answer_option;
end;
$$;

-- Match the grant pattern of the other get_vendor_* RPCs (the SECURITY DEFINER
-- gate above is what actually enforces vendor-tier access).
grant execute on function public.get_vendor_q15_cohorts() to authenticated;
