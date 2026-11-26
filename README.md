# AeroGuard

AeroGuard helps households make practical decisions during periods of poor outdoor and indoor air quality. It combines local air-quality and weather data with a household profile, then offers exposure-reduction guidance, a daily routine, and a DIY air-cleaner sizing estimate.

## Challenge vertical and persona

**Vertical:** Environmental health, focused on urban air-quality resilience.

**Persona:** A household navigating pollution episodes, with particular attention to children, older adults, people with respiratory or cardiovascular vulnerabilities, and people who commute outdoors.

## How it works

1. **Check local conditions.** The dashboard requests current and hourly pollutant and weather readings from Open-Meteo. The app combines particulate readings, US AQI, temperature, and wind with simple time-of-day rules to flag periods that may have more pollution trapping or better dispersion.
2. **Personalize recommendations.** A household profile records vulnerability factors, commute mode and distance, cooking/heating source, and whether the home has a purifier. A deterministic rules engine combines that profile with the **live** AQI and PM2.5 for the selected city to build a daily routine. Each step's impact is calculated, not fixed: inhaled PM2.5 avoided (concentration × breathing rate × hours × mask penetration), its cigarette equivalent, and commute CO₂ saved. Each step explains the number in plain language.
3. **GenAI explanation layer.** When a Gemini or Groq key is configured, `/api/routine` sends the computed plan and profile to the model. The model writes a household-specific headline and a "for your household" note for each step. The model only writes wording: its JSON reply is validated, every number still comes from the rules engine, and any unusable reply falls back to the rule-based text. The page shows which source wrote the text.
4. **Plan indoor filtration.** The IAQ Lab estimates clean-air delivery and air changes for a Corsi-Rosenthal box using room dimensions and selected fan/filter assumptions.
5. **Ask follow-up questions.** The assistant uses a configured Gemini provider first, then Groq, and finally a built-in rule-based response engine. The app remains usable without model-provider keys.
6. **Track local actions.** Community pledges and household impact counters help users keep a personal checklist. They are stored in the browser and are not verified reports of community participation or measured exposure changes.

## Features

- Current and hourly air-quality and weather readings for supported locations
- AQI category, pollutant details, and estimated inversion/dispersion windows
- Household profile and daily routine recommendations
- Corsi-Rosenthal box CADR and room air-change calculator
- Air-quality assistant with optional Gemini and Groq integrations
- Community advocacy templates and locally stored action tracking
- Light and dark themes

## Run locally

Requirements: Node.js and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Live air-quality and weather data require an internet connection and are provided by Open-Meteo. No Open-Meteo API key is required. The built-in assistant works without any model API key.

To enable a hosted language model, copy `.env.example` to `.env.local` and add a key for either provider:

```dotenv
GEMINI_API_KEY=
GROQ_API_KEY=
```

These are optional server-side configuration values. Do not commit real keys. Users can also configure provider keys in the app; those values are saved in browser local storage and included in assistant requests. A request using a configured key sends the prompt and context to the selected external provider. Do not enter a personal key on a hosted instance unless you trust its operator.

## Validation

```bash
npm test        # Vitest unit tests for the decision logic
npm run lint
npm run build
```

Unit tests in `src/__tests__/` cover AQI category boundaries, inhaled-dose and avoided-exposure maths, commute emission savings, Corsi-Rosenthal CADR/ACH sizing, and profile-driven routine generation (risk escalation with AQI, child- and car-specific advice).

## Security notes

- API routes validate input types and ranges (coordinates, AQI/PM2.5 values, string lengths). The assistant prompt is capped at 2,000 characters.
- Error responses are generic and never expose internal error messages.
- Server-side model keys are read from environment variables only and are never sent to the browser.
- Vendored third-party UI code (`src/kit/`) is excluded from lint.

## Project structure

- `src/app/`: dashboard and feature pages, plus API route handlers
- `src/components/`: shared interface components
- `src/lib/open-meteo.ts`: external air-quality and weather data integration
- `src/lib/heuristic-rules.ts`: routine generation, purifier estimates, and offline assistant responses
- `src/lib/ai-providers.ts`: optional model-provider selection and offline fallback
- `src/lib/store.ts`: browser-persisted preferences, profile, and action totals
- `src/types/`: shared application data types

## Assumptions and limitations

- Air-quality and weather readings come from Open-Meteo; availability and freshness depend on that service and network access.
- The inversion and safer-window indicators are simplified heuristics based on available forecast values and time of day. They are not direct atmospheric measurements, a guarantee of safe outdoor conditions, or a substitute for local official advisories.
- Routine, filtration, and impact figures are estimates derived from application rules and nominal inputs. They are not laboratory measurements or evidence of an individual's health outcome.
- This project is an educational decision-support tool, not medical advice. Follow local public-health guidance and consult a qualified clinician for personal medical decisions.
- Profile settings, model keys, and action totals are stored in the current browser. There is no account system or shared community database.
