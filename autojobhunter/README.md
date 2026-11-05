# AutoJobHunter / JobPilot Canada

**Status: recovered working web-beta source, NOT a compiled Android app or autonomous job hunter.**  
Baseline: Cloudflare Worker `autojobhunter-beta`, modified 2026-11-03. Imported on 2026-11-05.

## What is actually here

- `src/deployed-worker-2026-11-03.js` — complete 65,597-character **deployed Worker snapshot**, retrieved from the linked Cloudflare account, copied without intentional modifications.
- `web/index.html`, `web/icon.svg`, `web/manifest.webmanifest`, `web/sw.js`, `web/reviewer-guide.txt` — extracted assets from the Worker snapshot.
- `ROADMAP.md` — acceptance-gated delivery plan.
- `docs/EXECUTION_PROMPT.md` — one master prompt that resumes from this checkpoint.

The original developer repository and exact historic build pipeline were **not recovered**. The available web beta can be installed to the Android home screen as a browser PWA, but it is **not** a Google Play APK/AAB. The beta contains review and demo workflows, not verified live hourly job discovery or automated job applications.

The separate ChatGPT-assisted job research and email workflows are not software running inside this web app.

## Run the web source

For a local static smoke test from the `autojobhunter` directory:

```bash
cd web
python3 -m http.server 8000
# open http://localhost:8000 in Chrome
```

For the *deployed* beta, Cloudflare currently reports Worker `autojobhunter-beta` with enabled workers.dev subdomain `greatscott-monitor` and a `/beta/` route:

https://autojobhunter-beta.greatscott-monitor.workers.dev/beta/

Live external accessibility and current usability are not independently verified by this import.

## Privacy, safety, and funding scope

Use fictional records during review. Current local browser storage is not an encrypted vault; do not enter IDs, medical details, banking data or sensitive third-party records. Never send applications without an explicit user review and approval. No invented experience, guessed addresses, Craigslist scraping, bypassing CAPTCHAs or unauthorized portal automation. Never use Replit or incur paid infrastructure costs.

WorkBC CEP pilot proposal is separate and unsubmitted. Baseline work already performed is not to be represented as eligible new research costs. WorkBC eligibility and funding terms must be confirmed.

## Next steps

Read [ROADMAP.md](./ROADMAP.md) and [EXECUTION_PROMPT.md](./docs/EXECUTION_PROMPT.md). Create an independent `greatscottgilbert/autojobhunter` repository, move this `autojobhunter/` subtree to its root, preserve source provenance, fix storage reliability, add legal job-discovery sources, test a real Android debug APK, then pursue Google Play internal testing once owner approval and Play prerequisites are verified.
