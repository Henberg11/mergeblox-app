# MergeBlox — Number Merge Puzzle

A complete Expo (React Native) game: tap-to-merge number puzzle with AdMob banner, interstitial,
and rewarded ads wired in. Same build/publish pipeline as BuildCalc.

## What's in this folder

- `App.js`, `src/` — full game source (game logic, UI, ad hooks — no placeholders)
- `app.json`, `eas.json`, `babel.config.js`, `package.json` — Expo/build config
- `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png` — generated app icons
- `STORE_LISTING.md` — title, description, keywords ready to paste into Play Console
- `privacy-policy.html` — required for any app showing ads; needs to be hosted at a public URL

## Before you build: two IDs you must swap in

1. **AdMob App ID** (`app.json`, under `plugins`) — currently Google's public *test* ID.
2. **AdMob ad unit IDs** — in `src/AdBanner.js`, `src/useInterstitialAd.js`, and `src/useRewardedAd.js`,
   replace the `PRODUCTION_*_ID` placeholders with your real AdMob unit IDs, and flip `useTestAds` to
   `false` in all three files once you have real IDs everywhere. Shipping with test ads violates AdMob
   policy, so this isn't optional before going live.

## Build it — no Android Studio needed

Same as BuildCalc: connect this repo on the Expo dashboard (Project Settings → GitHub) and use
"Build from GitHub" to trigger a cloud build. Or locally:

```bash
npm install -g eas-cli
cd MergeBloxApp
npm install
eas login
eas build:configure
eas build --platform android --profile production
```

## Publish to Google Play

Same Play Console account as BuildCalc can publish this as a second app — no extra $25 fee, that
covers your account, not per-app. Steps:

1. Host `privacy-policy.html` publicly (GitHub Pages works, same as BuildCalc).
2. Create a new app entry in Play Console, fill in the listing using `STORE_LISTING.md`.
3. Upload the `.aab` from the EAS build.
4. Run the closed test (12 testers, 14 days) if this is still within your account's early period —
   check Play Console, as this requirement is per-account, not always per-app.
5. Apply for production access and submit for review.

## Local preview while developing

```bash
npm install
npx expo start
```
