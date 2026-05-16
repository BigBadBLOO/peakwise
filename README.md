# Peakwise

AI-powered fitness diary and recovery advisor. Tracks workouts, monitors readiness via morning check-ins, and adapts your training program automatically.

**Stack:** React Native · Expo · TypeScript  
**Platforms:** Android (primary), iOS

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | bundled with Node | — |
| Expo CLI | latest | `npm install -g expo-cli` |
| Expo Go app | latest | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779) |

---

## Local Development

### Quick start (Expo Go on device)

```bash
git clone https://github.com/BigBadBLOO/peakwise.git
cd peakwise
npm install --legacy-peer-deps
npm start
```

Scan the QR code in the terminal:
- **iOS** — use the default Camera app
- **Android** — open Expo Go and tap "Scan QR code"

> Phone and computer must be on the same Wi-Fi network.

### Run on emulator

```bash
# iOS Simulator (macOS + Xcode required)
npm run ios

# Android Emulator (Android Studio + AVD required)
npm run android
```

### Tunnel mode (different networks)

If the device and computer are on different networks (e.g. corporate Wi-Fi):

```bash
npm start -- --tunnel
```

Requires `@expo/ngrok`: `npm install -g @expo/ngrok`

---

## Project Structure

```
peakwise/
├── App.tsx                         # Entry point
├── app.json                        # Expo config
├── src/
│   ├── constants/
│   │   └── theme.ts                # Colors, spacing, radii
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Stack navigator (tabs + modal screens)
│   │   └── TabNavigator.tsx        # Bottom tab bar
│   └── screens/
│       ├── HomeScreen.tsx          # Dashboard + readiness card
│       ├── WorkoutScreen.tsx       # Weekly program
│       ├── ProgressScreen.tsx      # Charts and history
│       ├── ProfileScreen.tsx       # Settings and account
│       ├── CheckinScreen.tsx       # Morning check-in bottom sheet
│       └── ActiveWorkoutScreen.tsx # Live workout with timer
├── design/                         # Design system (HTML canvas, not shipped)
└── .github/
    └── workflows/
        └── build-android.yml       # CI: builds debug APK
```

---

## Building an APK (Android)

### Via GitHub Actions (recommended, no setup required)

Every push to `main` triggers an automatic build.

1. Go to **Actions** tab on GitHub
2. Open the latest **Build Android APK** run
3. Wait for it to finish (~8–12 min)
4. Download the APK from **Artifacts** → `peakwise-debug-{run_number}`
5. Transfer to your Android device and install

> Make sure "Install from unknown sources" is enabled on the device:  
> Settings → Apps → Special app access → Install unknown apps

### Trigger a manual build

Go to **Actions → Build Android APK → Run workflow** and click the green button. No code push needed.

### Local Gradle build (requires Android Studio)

```bash
npm install --legacy-peer-deps
npx expo prebuild --platform android --clean
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Publishing (Expo)

> Not yet configured. Steps below are for future use.

### EAS Build (cloud, free tier available)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### EAS Submit (to Play Store)

```bash
eas submit --platform android
```

Requires a Google Play developer account and a signed AAB (production build).

---

## Design System

The `design/` folder contains a standalone HTML canvas with the full Peakwise design system — tokens, components, and all 5 screens in light and dark mode.

Open locally:
```bash
open design/Peakwise\ Design\ System.html
```

No build step needed — runs entirely in the browser via React + Babel standalone.

---

## Common Issues

**Metro bundler port conflict**
```bash
npm start -- --port 8082
```

**`Unable to resolve module` error**
```bash
npm install --legacy-peer-deps
npx expo start --clear
```

**Expo Go shows "Something went wrong"**  
Check the terminal for the actual error. Most common cause: a native module that isn't supported by Expo Go (only relevant if adding new packages with native code).

**Android emulator not detected**  
Make sure the AVD is running in Android Studio before running `npm run android`.

---

## License

Private. All rights reserved.
