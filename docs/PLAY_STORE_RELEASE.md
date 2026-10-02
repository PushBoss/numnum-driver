# NumNum Driver Play Store Release

The driver app is an Expo/EAS Android application with package id `com.mynumnums_driver.app`.

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
npx eas-cli env:create --environment production --name EXPO_PUBLIC_MAPS_API_KEY --value "your-public-maps-key"
```

## Build and test

Preview builds need the same Supabase startup variables as production. Expo
embeds `EXPO_PUBLIC_*` variables in the application bundle; an APK built
without the two variables below exits before it can render the sign-in screen.
Create them once in the EAS `preview` environment, using the project's public
Supabase URL and anon key:

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

Confirm the names are present without printing their values:

```bash
npx eas-cli env:list preview
```

Use the preview APK for device testing:

```bash
npx eas-cli build --platform android --profile preview
```

Install that APK on the pilot driver phones and verify sign-in, delivery acceptance, navigation, location updates, pickup, completion, and offline/reconnect behavior.

## Play Store submission

Create or select the Google Play service account in EAS, then build the signed bundle:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production
```

The configured submission track is `internal`, so the first release can be tested through Play Console internal testing before promotion. Store listing copy, privacy policy, data-safety answers, screenshots, and the Google Play service-account key remain account-owner tasks and should be completed in Play Console.
