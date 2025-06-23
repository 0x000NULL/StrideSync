# 🏃‍♂️ Stride Keeper – Offline-Only Running Tracker App

A standalone, fully offline mobile running tracker built with **React Native (Expo)**. All data is stored locally using **SQLite** (via ElectricSQL). Includes real-time run tracking, detailed stats, route maps, and shoe mileage tracking. No cloud, no web, no backend API.

---

## 📌 Goal

Build a **mobile-only**, **offline-first** running tracker app featuring:

* 📱 React Native (Expo)
* 🗺️ Real-time GPS-based run tracking
* 📊 Dashboards and graphs
* 👟 Shoe mileage tracking and rotation
* 🗃️ Local-only SQLite storage with ElectricSQL (no remote sync)
* ❌ No cloud sync, no web app, no server or API

---

## 🧰 Tech Stack

* **React Native** via **Expo**
* **expo-sqlite** for local database
* **ElectricSQL** (used locally only for reactive data handling and sync queueing if desired)
* **expo-location** for GPS tracking
* **expo-task-manager** for background tasks
* **react-native-maps** for route visualization
* **Victory Native** or **react-native-svg-charts** for analytics
* Optional: **expo-file-system** for GPX/CSV import/export

---

## 📱 Core Features

### ✅ Run Tracker

1. **Start New Run**

   * Begins a new session with foreground or background GPS tracking.

2. **Live Tracking**

   * Track:

     * Distance
     * Elapsed time
     * Current pace
     * Route on a map
   * Works even if app is backgrounded.

3. **Stop Run**

   * Stops tracking and saves the run.

4. **Save & View**

   * View route on a map and detailed metrics:

     * Distance, time, pace, splits, calories
     * Elevation (if available)
   * Attach notes, RPE, mood, and **shoes used**

---

### ✅ Run Log & Details

* Historical list of all past runs
* Tap to view full details:

  * Route map
  * Run stats
  * Shoe used
  * Training load
  * Edit metadata

---

### ✅ Shoe Tracking

👟 **Add Running Shoes**

* Users can add shoes by:

  * Brand/model
  * Purchase date (optional)
  * Estimated mileage limit (e.g. 500 miles/km)

👟 **Assign Shoes to Runs**

* During or after each run, user selects the shoe worn
* Mileage is automatically tracked per shoe

👟 **Shoe Lifecycle Features**

* Total mileage and remaining lifespan per shoe
* Notifications or visual warnings when a shoe is "worn out"
* Shoe history available with run breakdowns

---

### ✅ Dashboards & Metrics

* Weekly, monthly, and lifetime summaries
* VO₂ Max estimation
* RPE × duration = training load
* Personal records (fastest 1K, 5K, 10K, etc.)
* Charts:

  * Pace over time
  * Elevation
  * Shoe wear
  * Cadence (if supported)

---

### ✅ Data Management

* **All data is 100% offline**
* Local SQLite via ElectricSQL
* Optional:

  * Export all data as JSON/CSV
  * Import runs from GPX/CSV files
* Backup/restore from device storage

---

## 📁 Folder Structure Example

```
stride-sync-app/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── RunTrackerScreen.js
│   │   ├── RunDetailScreen.js
│   │   ├── ShoeManagerScreen.js
│   │   ├── DashboardScreen.js
│   ├── components/
│   │   ├── MapView.js
│   │   ├── StatCard.js
│   │   ├── RunChart.js
│   │   ├── ShoeCard.js
│   ├── db/
│   │   ├── schema.js         # DB table creation
│   │   ├── runs.js           # Run insert/update
│   │   ├── shoes.js          # Shoe tracking logic
│   ├── utils/
│   │   ├── pace.js
│   │   ├── vo2max.js
│   │   ├── trainingLoad.js
│   └── App.js
```

---

## 🧪 Testing Strategy

* **Unit Tests (Jest):**

  * Run metrics, DB operations, data validators
* **E2E Testing (Detox):**

  * Start → Track → Save run flows
  * Shoe assignment and wear calculation
* **Manual Testing:**

  * GPS tracking in background
  * Permissions (location, storage)

---

## 🧾 Permissions & Platform Considerations

* **Location Tracking:**

  * Foreground & background via `expo-location`
  * Platform-specific permission dialogs and fallbacks

* **Battery Impact:**

  * Use low-frequency tracking option when app is backgrounded

* **Storage:**

  * Optional JSON/CSV export to file system

---

## ✅ Deliverables Checklist

| Component                | Status |
| ------------------------ | ------ |
| Offline run tracker      | ✅      |
| Local SQLite storage     | ✅      |
| Route mapping            | ✅      |
| Pace/time metrics        | ✅      |
| Charts & analytics       | ✅      |
| Shoe tracking            | ✅      |
| No cloud or backend      | ✅      |
| File import/export (opt) | ✅      |
| Testing + docs           | ✅      |