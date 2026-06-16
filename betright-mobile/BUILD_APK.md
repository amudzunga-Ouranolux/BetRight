# Build a shareable APK (dummy data)

This produces an installable Android APK running on **mock/dummy data** — no
backend required. The build runs in Expo's cloud (no Android Studio / Mac needed)
and gives you a download link + QR you can share.

## One-time setup
1. Create a free Expo account at https://expo.dev.
2. Install the CLI and sign in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. From `betright-mobile/`, link the project (writes the project id into app.json):
   ```bash
   eas init
   ```

## Build the APK
```bash
cd betright-mobile
npm run build:apk        # = eas build -p android --profile preview
```
- Takes ~10–20 min in the cloud. When it finishes, the terminal prints a **build
  page URL** with a **QR code** and an **APK download link** (also visible at
  https://expo.dev → your project → Builds).

## Install / share
- **On your phone:** scan the QR (or open the build link), tap **Install**, allow
  "install from unknown sources" when prompted.
- **Share with someone:** send them the build link (or the downloaded `.apk`).
  They open it on Android, allow unknown sources, and install. No Expo account
  needed to install.

## Notes
- The `preview` profile sets `EXPO_PUBLIC_USE_MOCK=true`, so the app shows sample
  predictions/teams/news entirely offline — perfect for showing the look & feel.
- iOS can't be sideloaded freely like Android; for iPhone testing use TestFlight
  (needs an Apple Developer account) — `eas build -p ios --profile preview`.
- To later point a build at the real backend, use the `production` profile and set
  `EXPO_PUBLIC_API_URL` in `eas.json`.
- If the cloud build fails, copy the EAS build log link and share it — native build
  errors (e.g. a config plugin) show up there.
