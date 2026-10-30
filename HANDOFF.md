# Handoff

StudioScout is a small personal static app: a visual global studio directory plus a lightweight local application tracker.

- Public studios live in `src/data/speculative-route-directory.json`.
- Enriched company details and sources live in `src/data/studio-profiles.json`.
- The active UI is the dark expandable directory and the Saved / In Progress / Applied / Interview / Offer / Archived tracker.
- Application entries are stored in browser localStorage only. No login, backend, encryption, remote sync, email or auto-application exists.
- The public directory includes every currently verified speculative route; the profile dataset is still being enriched. Mark unknowns honestly.
- Show HQ as a fallback only when the application route doesn't state hiring location. Show remote eligibility separately when confirmed.

Exclude studios materially focused on pornography/erotica/sexually explicit entertainment, gambling/betting/casinos (including simulated/social-casino games), recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice industries. Apply this to the studio's business/portfolio and to the actual project or role. Exclude routes that ask applicants to confirm comfort with such content. Leave unclear cases out pending manual review; incidental fictional references in mainstream games are not enough to exclude a studio.

Do not add job-board features, resume tools, outreach automation, AI scoring, crawler schedules or complex workflows.
