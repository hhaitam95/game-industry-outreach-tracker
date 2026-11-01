# ADR-066 — Fourth worldwide speculative-route research batch

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: ADR-059, ADR-063, ADR-064 and ADR-065.

## Goal

Expand the verified directory with 12 more game-industry opportunities, especially remote-first employers, publisher-side operations, multiplayer services and Minecraft content teams. Refresh an existing route where the official employer material now explicitly documents global remote hiring.

## New routes proposed

- Shiro Games — France; general application by email for experienced game developers; Bordeaux-based.
- Olive Branch Interactive — HQ not stated; open application for programmers, artists and designers; official careers page describes worldwide remote work.
- Com2uS Europe GmbH — Germany; general application pool covering esports, marketing, community, video content and related publishing operations; Berlin availability required.
- Garena — Singapore; entry-level General Openings pool spanning game operations, marketing, game design, product management and software engineering; relevant bachelor's degree required.
- Wolfjaw Studios — United States; evergreen engineering application and linked producer application; remote only in employer-listed US states.
- Wonder Works Studio — United States; General Application; full-time and marked Remote Any, country eligibility unstated.
- Kabam — Canada; Lever General Application; full-time in-office, with studio-city location or relocation requirement.
- Mainframe Industries — Finland; unsolicited application by email; pan-European distributed developer with Helsinki, Reykjavík and Paris studios.
- Funder Games — HQ not stated; senior-contributor General Application; **current collaborations are volunteer/unpaid while the project is pre-funding**.
- Starfish Studios — United States; TalentHR General Application for its remote Minecraft studio; ATS location lists the United States.
- Spark Universe — Germany; TalentLyft General Application for its Minecraft games, mods and events group.
- GoE-Craft — HQ not stated; general application for a Minecraft Marketplace content studio; opportunities include remote, freelance and commission-based work.

## Existing route refresh

- Speedway Games — refresh the official General Application review date and set work model to remote, consistent with the General Application's Global location and the current careers page describing a remote-first asynchronous team.

## Inclusion and caveats

- The studio-controlled page or employer-managed application platform explicitly invites applications without a matching vacancy or accepts candidates for future matching.
- A normal careers page, an advertised vacancy alone, a generic contact form without an application invitation or an aggregator-only claim is not enough.
- Work eligibility follows the employer's wording. Remote does not imply worldwide hiring unless the employer says so.
- Wolfjaw's eligible US-state list, Kabam's studio-city relocation condition, Com2uS Europe's Berlin availability and Shiro Games' Bordeaux base are retained.
- Funder Games is volunteer/unpaid while pre-funding; it must not be presented as a paid job. GoE-Craft includes a mix of full-time, freelance and commission-based terms.
- Starfish's portal lists the United States despite a distributed team; international eligibility remains unknown. Wonder Works' Remote Any flag does not establish eligible countries.
- The Spark Universe talent form offers optional 18-month retention consent. Applicant consent is not assumed.
- No scraped page bodies, private applicant data or personal application tracker records are stored.

## Leads held out

- Inviox Studios: public materials contain inconsistent employer scale/metrics and limited portfolio detail; retain for manual review.
- Terra Localizations: localization vendor, not a game studio or game-development service studio within the current inclusion definition.
- Rocket Science Group: multiple brands/employers and unclear attribution of its careers routes; defer until the intended employer and route are unambiguous.
- GameMode One, Digital Extremes and Offworld Industries: no qualifying official general/open application route was confirmed in this pass.

## Verification and rollback

- Keep exactly one directory record and one profile per studio.
- Validate required fields, duplicate names, HTTPS URLs, route enums and profile sources.
- Run Python discovery tests, frontend tests, route/profile validator, route review, production build, privacy boundary, Pages artifact and browser acceptance on the exact PR head.
- Recheck routes within 90 days or earlier if official pages change.
- Roll back only this batch's data/documentation change; do not edit private discovery-state history or the local-only tracker.
