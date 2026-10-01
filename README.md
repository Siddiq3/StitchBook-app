# StitchBook app

## Run locally

Install dependencies with `npm install`. Configure the API URL in `.env` using `.env.example`.

For Android authentication, run `npm run android` to build and install the native app on an emulator or connected device. For later JavaScript-only changes, run `npm start` and reload the installed StitchBook app. Rebuild with `npm run android` after adding or updating a native dependency.

Expo Go does not contain this app's Google Sign-In or MSG91 biometric modules. It can preview the UI, but native Google sign-in requires the installed StitchBook build. A Metro reload does not add native modules to an old APK.

Android uses React Native autolinking for `RNGoogleSignin` and MSG91's `BiometricAuth`; do not manually register duplicate packages. Mobile OTP login remains disabled in the current login screen.

## Checks

- `npm run test:ui` — UI foundations and translation coverage.
- `npm run test:services` — native-module availability, auth persistence and service import cycles.
