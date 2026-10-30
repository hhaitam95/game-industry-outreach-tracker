# StudioScout

A personal, visual directory of game studios with verified speculative/open application routes, plus a lightweight application tracker.

## What is in the site

- A dark, searchable studio table covering all studios currently in the verified speculative-route directory.
- Studio marks, HQ flags, selected game artwork, company type, ownership, known titles, indicative studio scale and employee information where researched.
- Expandable studio profiles with branches, application-location notes, official links and source references.
- A local-only application board with Saved, In Progress, Applied, Interview, Offer and Archived (Not moving forward) statuses.

The table shows the headquarters when a speculative route does not say where the application is for. HQ is labelled as such; it is not a claim that a role is based there. Where the route specifies a remote region or hiring location, that is shown separately.

Some studio profiles are more complete than others. Unknown employee counts, city locations and ownership details are labelled as undisclosed or not researched rather than guessed. Studio scale (AAA/AA/Indie) is an indicative editorial classification, not a formal industry rating. Game images are artwork/cover thumbnails rather than official game logos; studio marks use the studio website's favicon when available and fall back to initials.

## Application tracker

The tracker is intentionally simple. Saving a studio adds it to Saved. The expanded profile has a separate **Confirm application sent** action; after confirmation, it is added to Applied. Statuses can then be changed manually.

Application records are stored in this browser's local storage. There is no login, server, account, encrypted vault, email sending or automatic application submission. The data is not synced across browsers or devices and can be lost if browser site data is cleared. This is a personal workspace, not a shared/private authenticated service.

## Studio inclusion rules

A studio is listed only when its own website or a studio-controlled application system explicitly accepts speculative, unsolicited, open or general applications without requiring a specific advertised vacancy. Generic careers pages, advertised roles and aggregator claims alone do not qualify.

Exclude studios whose game portfolio, core business, or the actual work being recruited for is materially focused on adult, vice-oriented or age-restricted sectors, including:

- Pornography, erotica, adult-only sexual games and sexually explicit entertainment.
- Gambling, betting, casinos, sportsbooks, lotteries, poker/slots and wagering products, including simulated/social-casino games.
- Recreational drugs, cannabis and marijuana.
- Alcohol, tobacco, nicotine and vaping.
- Closely related adult-entertainment or vice industries.

Also exclude routes that ask applicants to confirm comfort with such content. When suitability is unclear, leave the studio out pending manual review. This is not a blanket exclusion of mainstream games for incidental fictional references to mature themes.

## Research and data quality

Public studio directories are candidate sources only. Every application route must be checked against the studio's own site or a studio-controlled application system. Profile facts link to sources in the expanded studio view. Headcounts and company-size ranges must include a reference period and source type where possible; do not treat project credits as proof of employment or ownership.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```


## Application-route research data

The directory is backed by a version-controlled JSON dataset in `src/data/speculative-route-directory.json`, paired with studio profiles in `src/data/studio-profiles.json`. This is the source data used to build the static website; it is not a hosted server-side database.

Each route record now also has an `applicationResearch` object to support future discovery and maintenance:

- `routeType`: speculative, unsolicited, spontaneous, open, general or discipline-specific.
- `submissionMethods`: ATS, email, website form or contact form.
- `workModel` and `eligibleLocations`: kept separate from studio headquarters.
- `disciplineScope` and `relatedApplicationUrls`: for routes limited to a team or discipline, or where a studio publishes multiple route links.
- `routeStatus`, `sourceType`, and `nextReviewAt`: to support route health checks and re-verification.

`checkedAt` is the last verification date. The default review interval is 90 days. Run `npm run routes:review` to see routes due for re-checking; pass `--as-of=YYYY-MM-DD` to inspect the dataset as of another date. Run `npm run check:studio-directory` to validate required profile, source and research fields.
