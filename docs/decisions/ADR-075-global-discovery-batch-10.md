# ADR-075 — Global discovery batch 10: Fawkes Games and two review holds

- Date: 2026-10-31
- Status: Proposed on PR #70; not merged to main
- Depends on: Global Discovery Implementation Model; ADR-071 through ADR-074.

## Decision

Add Fawkes Games after new first-party evidence clarified that the company does more than publish and operate legacy games: it has an active Unity game-engineering/game-art/game-design hiring pipeline and documents direct game client modernization, gameplay-system overhauls and content development. Keep its hybrid business classification explicit.

Hold DreamCentury Entertainment because the official rules show a paid-credits mode in a prize/reward game network; assess this against the gambling exclusion before publication. Hold President Studio because its official careers page invites spontaneous applications, but the linked application endpoint returned HTTP 502 during this check.

## New verified route: Fawkes Games — Bulgaria

- Official website: https://fawkesgames.com/
- Official Careers / evidence / application page: https://fawkesgames.com/en/careers/
- Official Terms of Service: https://fawkesgames.com/en/terms/
- Route evidence: the official Careers page explicitly invites candidates who do not see a suitable role to send a spontaneous application. The same page lists Unity Game Engineer, 2D Game Artist, Game Designer, Producer and 2.5D Pixel Artist positions; current roles are remote freelance, with Europe-friendly time zones preferred.
- Developer identity: the official homepage calls the business “Fawkes Games Studio”; the official About material says it is a European publisher focused on reviving and expanding classic online worlds. The Terms and Careers pages clarify an in-house development/live-service operation: the company performs or commissions game-client modernization, gameplay-system overhauls, content expansions and updates; the company also advertises Unity engineering, game-art and game-design roles.
- Portfolio identity: Fawkes operates Shaiya, Defiance, Last Chaos, Desert Operations, Wargame 1942 and The Last Train. The public profile labels these as operated/live-service titles and does not falsely claim all are original-IP games created by Fawkes.
- Legal identity: Terms identify Fawkes Games LTD, registered in Bulgaria, with registered office Pere Toshev 105, Plovdiv, Plovdiv 4004; VAT number BG206874802.
- Classification: Developer / publisher / live-service operator. This is not an original-IP-only studio, but it satisfies the developer gate because the employer documents direct game-software and gameplay development/maintenance and hires Unity/game-design/art staff for that work.
- Work model: Careers page says remote worldwide. The listed roles are freelance and prefer Europe-friendly time zones.
- Route: official Careers page's Spontaneous Application control; the route is recorded as website_form because the application control is on the official career page.

## Manual review: DreamCentury Entertainment — France

- Official recruitment page: https://www.dreamcentury.com/playbox/site/recrutement/index.asp
- Actual spontaneous application form: https://www.dreamcentury.com/playbox/site/recrutement/candidaturespontanee.asp
- Official homepage: https://www.dreamcentury.com/playbox/site/index.asp
- Official contest/game terms: https://php.dreamcentury.com/backend/external/madnetix/reglement_site/reglement_madwin_en.php and https://php.dreamcentury.com/backend/external/madnetix/reglement_site/reglement_wonderz_en.php
- Studio gate: the official site calls DreamCentury a game creator since 1999, says its games began on the web and expanded to mobile/tablet, describes around 50 games and lists a team with web developers and a lead graphic designer. It appears to create digital casual games.
- Route gate: its recruitment landing page explicitly invites a spontaneous application; the linked form accepts a CV and motivation letter.
- Policy uncertainty: its game-platform terms describe Free Rounds and a Credits Mode. Members can purchase game credits, use those credits to enter games, earn points based on game scores and redeem points for gifts. This may be a paid prize/contest gaming business and is close enough to the user's gambling/iGaming boundary that it should not be silently published or automatically excluded.
- Decision: manual review, not in the public directory. Resolve the actual business model and whether paid entry/points/gifts are material gambling/prize-game activity before applying the exclusion policy. Do not equate ordinary casual game development with gambling solely from a keyword.

## Manual review: President Studio S.A. — Poland

- Official homepage: https://www.president-studio.com/en
- Official games page: https://www.president-studio.com/en/games
- Official Careers page: https://www.president-studio.com/en/careers
- The official games page describes President Studio as a Warsaw-based development studio and publisher, and lists Celestial Empire, Crime Scene Cleaner, Ship Builder and Viking City Builder. The official Careers page explicitly invites spontaneous applications when no listed role fits and asks for a CV and portfolio.
- The official Careers page links to an external Talent Solution / TSP application destination, https://www.presidentstudio.tsp.link/pl/kontakt.
- That linked endpoint returned HTTP 502 Bad Gateway during review; the actual application destination could not be verified as usable.
- Decision: hold from the public directory pending a successful recheck of the official application link or an alternate official submission route. Do not treat a temporary 502 as evidence that speculative applications have been withdrawn.

## Previous Fawkes review superseded

The earlier manual hold described Fawkes only as a publisher/operator and did not establish direct in-house game development. Newer official evidence now documents game-client modernization, gameplay overhauls, content updates and active Unity engineering/game-design hiring, so the hold is resolved in favour of inclusion with an explicit Developer / Publisher / Live-service operator classification.

## Dataset / validation

- Proposal dataset after this pass: **308 route records / 308 matching profiles**.
- Route status: **304 active / 4 paused**.
- Country/location labels: **51**.
- One new route/profile pair: Fawkes Games (Bulgaria).
- DreamCentury Entertainment and President Studio remain review candidates, not public route entries.
- Run Python discovery tests, frontend tests, lockfile registry, directory validator, route review, production build, privacy boundary, Pages artifact validation and browser acceptance on the exact PR head.
- Do not merge or deploy without normal review and exact-head CI success.
