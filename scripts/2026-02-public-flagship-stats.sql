-- =============================================================================
-- Public flagship stats — one hero figure per theme for the FREE
-- /workforce-intelligence teaser. Market-level only. Anon-callable.
--
-- CONTRACT (one row per theme, never an answer array):
--   theme_key      text     -- matches WorkforceTheme / THEME_ORDER exactly
--   headline_pct   numeric  -- single integer percentage (0-100), or NULL when
--                              the flagship question is missing / below the
--                              reporting floor (the free page then shows a
--                              label-only locked card, never an error)
--   headline_label text     -- the single answer option (top-answer themes) or a
--                              fixed descriptor (sum-class themes)
--   base_n         bigint   -- count(distinct response_ref) for the flagship q
--
-- WHY SAFE ON A PUBLIC PAGE: returns exactly one reduced number + label per
-- theme. It never returns per-answer distributions, so nothing that belongs to
-- the paid dashboard leaks. It mirrors the SAME flagship question and reduction
-- that lib/flagship-stats.ts (FLAGSHIP_STATS) uses on the premium side:
--   * sum-class themes  -> share of distinct respondents whose answer is in a class
--   * top-answer themes -> the single most-selected answer and its share
--
-- -----------------------------------------------------------------------------
-- !! CONFIRM BEFORE RUNNING — these identifiers cannot be read from the app repo
--    (the other RPC bodies live only in Supabase). Adjust to match the objects
--    the get_premium_* functions already use for the current GWD 2026 wave:
--
--   (1) <<RESPONSES_VIEW>>   the response-level view/table. Spec calls it
--                            v_responses. It must expose: response_ref,
--                            q_code (or question_key), question_label,
--                            answer_option, and the wave selector columns.
--   (2) <<WAVE_SELECTOR>>    the predicate that scopes to the current Global
--                            Workforce Deployment 2026 wave — the SAME literals
--                            get_premium_mmi/get_premium_breakdown use (e.g.
--                            report_name = 'Global Workforce Deployment 2026',
--                            or report_name = '...' AND source_year = 2026).
--   (3) The answer-CLASS regexes below (class_re) and the question NEEDLE
--       regexes assume the stored option/label wording. Eyeball the verify
--       query output and adjust any regex whose theme comes back NULL.
-- =============================================================================

create or replace function public.get_public_flagship_stats()
returns table (
  theme_key      text,
  headline_pct   numeric,
  headline_label text,
  base_n         bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    -- Current-wave response rows, normalized for matching.
    select
      r.response_ref                              as response_ref,
      lower(coalesce(r.q_code, ''))               as qc,
      lower(coalesce(r.question_label, ''))       as ql,
      r.q_code                                    as q_code,
      r.answer_option                             as answer_option,
      lower(btrim(coalesce(r.answer_option, ''))) as ao
    from <<RESPONSES_VIEW>> r
    where <<WAVE_SELECTOR>>
  ),
  -- Per-theme config: needle picks the flagship question; mode selects the
  -- reduction; class_re matches the class of answers to sum (sum-class / match
  -- themes); label_override is the fixed descriptor for sum-class themes.
  cfg(theme_key, needle, mode, class_re, label_override, ord) as (
    values
      ('Strategy & maturity',       'scope|complex',                 'sumclass', '^(5|6|7)$',                              'agree the scope and complexity will grow', 1),
      ('AI & technology',           '(^|[^a-z])ai([^a-z]|$)|artificial', 'sumclass', 'production|pilot|already using|in use', 'already using or piloting AI',              2),
      ('Experience & Outcomes',     'success|measure',               'matchone', 'business|objective',                     null,                                        3),
      ('Future of mobility',        'state|program|direction',       'top',      null,                                     null,                                        4),
      ('Employee experience',       'employee|expect',               'top',      null,                                     null,                                        5),
      ('Leadership expectations',   'leadership|expect',             'top',      null,                                     null,                                        6),
      ('Operational pressure',      'pressure',                      'top',      null,                                     null,                                        7),
      ('Business travel',           'accountab|compliance',          'top',      null,                                     null,                                        8),
      ('Investment & vendors',      'outsourc',                      'top',      null,                                     null,                                        9),
      ('International remote work', 'remote',                        'sumclass', '^yes',                                   'support international remote work',         10),
      ('Who took part',            'headquart|hq|location',          'top',      null,                                     null,                                        11)
  ),
  -- One flagship q_code per theme: the matching question with the largest base.
  flag_q as (
    select
      c.theme_key, c.mode, c.class_re, c.label_override, c.ord,
      (
        select b.q_code
        from base b
        where b.qc ~ c.needle or b.ql ~ c.needle
        group by b.q_code
        order by count(distinct b.response_ref) desc
        limit 1
      ) as q_code
    from cfg c
  ),
  reduced as (
    select
      fq.theme_key, fq.mode, fq.label_override, fq.ord,
      (select count(distinct b.response_ref) from base b where b.q_code = fq.q_code) as base_n,
      -- top-answer reduction
      (
        select b.answer_option from base b where b.q_code = fq.q_code
        group by b.answer_option order by count(distinct b.response_ref) desc limit 1
      ) as top_option,
      (
        select count(distinct b.response_ref) from base b where b.q_code = fq.q_code
        group by b.answer_option order by count(distinct b.response_ref) desc limit 1
      ) as top_count,
      -- class reduction (sum-class / matchone)
      (
        select count(distinct b.response_ref) from base b
        where b.q_code = fq.q_code and b.ao ~ fq.class_re
      ) as class_count,
      (
        select b.answer_option from base b
        where b.q_code = fq.q_code and b.ao ~ fq.class_re
        group by b.answer_option order by count(distinct b.response_ref) desc limit 1
      ) as class_option
    from flag_q fq
  )
  select
    r.theme_key,
    -- Suppress below the reporting floor (n < 10): NULL pct -> label-only card.
    case
      when r.base_n is null or r.base_n < 10 then null
      when r.mode = 'top'   then round(100.0 * r.top_count   / nullif(r.base_n, 0), 0)
      else                        round(100.0 * r.class_count / nullif(r.base_n, 0), 0)
    end as headline_pct,
    case
      when r.mode = 'top'      then r.top_option
      when r.mode = 'matchone' then r.class_option
      else coalesce(r.label_override, r.top_option)
    end as headline_label,
    coalesce(r.base_n, 0) as base_n
  from reduced r
  order by r.ord;
$$;

-- Public teaser: readable by anonymous and signed-in visitors. The function only
-- ever returns one reduced figure per theme (no distributions), so anon read is
-- intended here, unlike the get_premium_* / get_vendor_* functions.
grant execute on function public.get_public_flagship_stats() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- VERIFY (run once, eyeball each theme; any NULL headline_pct means that theme's
-- needle/class regex did not match the stored wording — adjust cfg above):
--   select * from public.get_public_flagship_stats() order by theme_key;
-- -----------------------------------------------------------------------------
