# Commit & Release Process

This document describes the recommended day-to-day workflow for contributing code and releasing updates to Stride Keeper using **Expo**, **EAS**, and over-the-air (OTA) updates provided by `expo-updates`.

---
## 1. Quality gate before every commit

Run the following commands and fix any issues **before** pushing:

```bash
npm run format   # prettier / eslint --fix (auto-formats the code)
npm run lint     # eslint (should exit with zero errors)
npm run test     # jest (all unit tests must pass)
```

> 💡  CI will reject the build if any of these steps fail, so running them locally saves round-trips.

---
## 2. Bump version numbers

Before shipping any changes, update the version numbers in the following files:

### package.json
```json
{
  "version": "1.0.5"
}
```

### app.json
```json
{
  "expo": {
    "version": "1.0.5"
  }
}
```

### src/screens/SettingsScreen.js
Update the hardcoded version string:
```jsx
<Text style={styles.versionText}>Stride Keeper v1.0.5</Text>
```

> 💡 **Tip:** Use semantic versioning (MAJOR.MINOR.PATCH) where:
> - **PATCH** (1.0.4 → 1.0.5): Bug fixes and small improvements
> - **MINOR** (1.0.5 → 1.1.0): New features that don't break existing functionality  
> - **MAJOR** (1.1.0 → 2.0.0): Breaking changes

---
## 3. Shipping JavaScript-only changes (OTA)

Stride Keeper uses *two* release channels:

* **staging** – internal testers / QA
* **production** – end users in the stores

Follow this flow for every change that **does not** touch native code (i.e. no new Expo/React-Native modules, no permissions, no config-plugin changes, no SDK bump):

```bash
# 1. Upload the update to the "staging" channel

EAS_UPDATE_MESSAGE="Fix: incorrect pace calculation" \
  eas update --channel staging --message "$EAS_UPDATE_MESSAGE"

# 2. QA / smoke-test the update on a device or simulator.
#    You can install the staging build via TestFlight, internal track, or Expo Go.

# 3. Promote the *exact same* update to production once verified

eas channel:promote staging production
```

Users will download the new bundle the next time they launch the app. No app-store review is required.

---
## 4. When native code or build-time config changes

Some changes still **require a new binary** (e.g. adding native modules, modifying permissions, upgrading the Expo SDK). In that case:

1. **Bump the runtime version** so old binaries don't receive incompatible JS bundles.
   * In `app.json` / `app.config.js`:

     ```json5
     {
       "expo": {
         "runtimeVersion": { "policy": "appVersion" },
         "version": "1.4.0",          // iOS buildNumber
         "android": { "versionCode": 12 }
       }
     }
     ```

2. **Build & submit** new store binaries:

   ```bash
   eas build --platform ios
   eas build --platform android
   # once finished
   eas submit --platform ios
   eas submit --platform android
   ```

3. **(Optional) OTA patch after approval** – Once the stores approve the binary you can still push future JS-only fixes to the same runtime version using the staging → production flow above.

---
## 5. Quick reference

| Task                                | Command |
| ----------------------------------- | -------- |
| Format, lint, test                  | `npm run format && npm run lint && npm run test` |
| OTA update to staging               | `eas update --channel staging --message "…"` |
| Promote staging → production        | `eas channel:promote staging production` |
| Bump runtimeVersion & build new apk | `eas build --platform android` (or `ios`) |

---
Happy shipping! :rocket: 