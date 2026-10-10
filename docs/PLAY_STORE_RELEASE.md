# NumNum Driver Play Store Release

The driver app is an Expo/EAS Android application with package id `com.mynumnums_driver.app`. The last submitted release is `NumNum Driver` 1.0.1 (`versionCode` 4); the next candidate is 1.0.2 (`versionCode` 5).

## First-time setup

Run these commands from `numnum-driver` with Node 20 or newer. Use `eas-cli`; the shorter `eas` package name resolves to a different npm package.

```bash
nvm use 20
node --version
npx eas-cli login
npx eas-cli init
```

`eas-cli init` attaches this app to the Expo project and adds the project id to `app.json`. Keep that generated id; it is not a secret.

## Upload-key recovery

Do not run `keytool` with the example text `path/to/your-keystore.jks` or `YOUR_ALIAS`. First download the production Android credentials from EAS:

```bash
npx eas-cli credentials --platform android
```

Select `production`, then the Android keystore download option. EAS will report the actual keystore path and alias. Use those values in the export command:

```bash
keytool -export -rfc \
  -keystore "/actual/path/from-eas/upload-keystore.jks" \
  -alias "actual-alias-from-eas" \
  -file numnum-upload-key.pem
```

Keep the keystore, passwords, and PEM file private. Upload only the PEM certificate to Play Console when requesting the upload-key reset; never commit these files.

Set the production variables in the EAS project, not in a committed `.env` file:

```bash
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_FLEETS_API_URL --value "https://fleets.mynumnums.com"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "your-public-maps-key"
```

The Google Maps key is optional for the current app: without it, the Driver uses an OpenStreetMap view inside the app and can open the stop in Maps for turn-by-turn navigation. Add the key to the EAS environment only if the native Google Maps provider is desired; never commit it.

## Build and test

Expo embeds `EXPO_PUBLIC_*` variables in the application bundle. Create these
variables in both the EAS `preview` and `production` environments, using the
project's public Supabase URL and anon key. The app now displays a configuration
screen rather than crashing if either Supabase value is missing, but a build
without them cannot sign in or operate.

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

Confirm the names are present without printing their values:

```bash
npx eas-cli env:list preview
npx eas-cli env:list production
```

Use the preview APK for device testing:

```bash
npx eas-cli build --platform android --profile preview
```

Install that APK on the pilot driver phones and verify sign-in, delivery acceptance, navigation, location updates, pickup, completion, and offline/reconnect behavior.

## Rejection recovery checklist

- Ensure the Play listing title is exactly `NumNum Driver` and upload `src/assets/brand/play-store-icon.png` as the 512x512 Play Store app icon. It uses the same NumNum smile-symbol artwork as the consumer app, without launcher text; the Android adaptive launcher icon uses that symbol centered on white. Keep the title and symbol consistent between the listing and installed app.
- In Play Console's **App access / Sign in details**, provide a real, active driver account provisioned by a fleet manager. Put the driver's phone number in the username field and its 6-8 digit PIN in the password field. Do not use the driver's contact email or the hidden `driver+...@drivers.numnum.test` Supabase auth identifier; email sign-in is not supported. In the reviewer instructions, say: "Sign in with the phone number and PIN provided below. This app does not use email sign-in or require an invitation to be accepted at login." Keep this account enabled and its PIN unchanged while review is in progress.
- Before submitting, test the exact Play Console phone/PIN on a clean install of the production-signed build. Confirm the account has a `driver` profile in the intended fleet. If review is expected to inspect delivery flow, ensure a safe test job is assigned and explain how to reach it; do not provide a manager or fleet-admin credential.
- Build a fresh preview APK with the same environment as production, install it cleanly, and verify it opens to the sign-in screen without closing. Check that `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` exist in EAS `production` before producing the AAB.
- Increment Android `versionCode` for each replacement upload. The next candidate uses 5.
- The 1.0.2 Driver APK/AAB includes the safe-area-aware tab bar, OSM map fallback, job refresh, login validation, and recoverable session restoration. Before Play submission, install the production-signed candidate and test sign-in, a job assigned to the exact driver profile, location refresh, accept/cancel/complete, and map directions. The app refreshes the dispatch queue every 20 seconds as a fallback to realtime; Fleet and Driver both key the assignment by the driver's `profiles.id`.
- If the new preview build still closes, retrieve the Android crash stack from Play Console's Android vitals or `adb logcat`; the policy notice alone does not identify a native crash cause.

Correcting the Play Console sign-in details does not require a new AAB. The clearer in-app validation and wording above do require a new build if you want them included in the reviewed binary.

## Play Store submission

The previous production AAB was version `1.0.1` (Android `versionCode` 4) at `~/Downloads/NumNum-Driver-1.0.1-code-4.aab`. The next production build should be version `1.0.2` (`versionCode` 5); EAS must use the existing Play upload credential. Verify the resulting artifact's signing certificate against Play Console before upload.

Create or select the Google Play service account in EAS, then build the signed bundle:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production
```

The configured submission track is `internal`, so the first release can be tested through Play Console internal testing before promotion. Store listing copy, privacy policy, data-safety answers, screenshots, and the Google Play service-account key remain account-owner tasks and should be completed in Play Console.
