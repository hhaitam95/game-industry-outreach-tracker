# Product decisions

**Date:** 31 October 2026

Game Industry Outreach Tracker is a personal game-industry research tool with two core functions:

1. A dark, searchable and expandable directory of studios with verified official speculative/open/unsolicited/general application routes.
2. A lightweight application tracker stored in the user's browser using localStorage.

## Directory rules

- Show HQ as a labelled reference when an application route does not state a hiring location. Never imply that HQ is the job location.
- Show confirmed remote eligibility or application geography separately.
- Include sourced company type, parent/subsidiary relationship, selected games, indicative industry scale and headcount details where available.
- Label AAA/AA/Indie as editorial guidance, not an official rating.
- Exclude studios materially focused on pornography/erotica/sexually explicit entertainment, gambling/casinos/betting (including simulated casino games), recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice industries. Leave unclear cases out pending manual review.
- Never invent locations, ownership, employee numbers or game credits.

## Tracker rules

- Statuses: Saved, In Progress, Applied, Interview, Offer and Archived (Not moving forward).
- Saving a studio adds it to Saved.
- A separate user confirmation records an actually submitted application and moves it to Applied.
- Records stay in browser localStorage. No login, backend, encryption, remote sync, email sending or automatic application submission is required for this single-user tool.
- Browser data can be cleared and does not sync across devices.

## UI decisions — Phase B first batch

- Use bundled Bootstrap 5 CSS and a simple, information-dense interface; avoid decorative dashboards and unnecessary interaction.
- Theme choice is saved locally and defaults to the operating-system preference on first visit.
- Studio marks use website favicons with initials as a fallback. Headquarters flags use ISO country codes where available and never imply work eligibility.
- The automation indicator reads public GitHub Actions history and distinguishes the latest attempt from the most recent successful run.
- `addedAt` is separate from `checkedAt`; the yellow NEW marker expires 24 hours after first publication. Legacy records are not backfilled or marked new.
- Application records remain browser-local. The theme preference is a separate local setting.

## Out of scope

No general job board, resume editor, outreach generator, AI scoring, automatic crawling, scheduled scans, public user accounts, multi-user access, analytics dashboard or email integration.
