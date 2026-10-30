# Handoff

StudioScout is a small personal static app: a worldwide studio directory of verified speculative application routes plus a lightweight local application tracker.

- Public verified routes: src/data/speculative-route-directory.json.
- Studio details: src/data/studio-profiles.json.
- Active UI: StudioDirectory and ApplicationTracker.
- Personal application records stay in browser localStorage only.
- Candidate/source progress lives on the separate discovery-state branch.

The active discovery script is scripts/discover_speculative_studios.py. It collects studio leads from public directories and structured sources, deduplicates them, then verifies any speculative application route against the studio's own website or a directly linked employer-controlled application platform. Candidate directories and generic careers pages are never treated as proof of acceptance.

Keep the product to two pages. Do not reintroduce the old job-posting monitor, resume tools, outreach drafting, analytics, accounts, remote tracker sync or automatic applications.

Exclude studios materially focused on pornography/erotica/sexually explicit entertainment, gambling/betting/casinos (including simulated/social-casino games), recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice industries. Leave uncertain cases out pending manual review. Mark unknown hiring locations and remote eligibility honestly.
