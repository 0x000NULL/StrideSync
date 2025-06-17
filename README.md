# 🏃‍♂️ StrideSync – Offline Running Tracker

A mobile running tracker built with React Native (Expo) that works entirely offline. Track your runs, monitor your shoe mileage, and analyze your running statistics without needing an internet connection.

## 📱 Features

- 🏃 **Run Tracking**
  - Real-time GPS tracking
  - Distance, pace, and duration metrics
  - Route mapping
  - Run history with detailed statistics

- 👟 **Shoe Management**
  - Track mileage for multiple pairs of shoes
  - Shoe rotation suggestions
  - Mileage-based replacement alerts

- 📊 **Statistics**
  - Weekly/Monthly distance totals
  - Pace trends
  - Run frequency analysis
  - Personal records tracking

- 🎨 **User Experience**
  - Dark/Light theme support
  - Intuitive interface
  - Quick actions for common tasks
  - Data export options

- 🛠 **Technical**
  - Offline-first architecture
  - Local data persistence
  - Battery efficient
  - Built with modern React Native & Expo

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9+) or yarn (v1.22+)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator or a physical device with the Expo Go app

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stride-sync-app.git
   cd stride-sync-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Run on your device:
   - Scan the QR code with the Expo Go app (iOS) or the Camera app (Android)
   - Or press 'i' for iOS Simulator or 'a' for Android Emulator

## 📚 Documentation

### User Guides
- [Getting Started](./docs/user-guides/getting-started.md)
- [Run Tracking](./docs/user-guides/run-tracking.md)
- [Shoe Management](./docs/user-guides/shoe-management.md)

### Developer Guides
- [Setup](./docs/developer-guides/setup.md)
- [State Management](./docs/developer-guides/state-management.md)

## 🏗 Project Structure

```
src/
├── assets/           # Images, fonts, and other static files
├── components/       # Reusable UI components
│   ├── ui/          # Basic UI components (buttons, inputs, etc.)
│   └── ...
├── navigation/      # Navigation configuration
├── screens/         # Screen components
├── stores/          # State management with Zustand
│   ├── runStore.js
│   ├── shoeStore.js
│   ├── settingsStore.js
│   └── index.js
├── theme/           # Theming and styling
└── utils/           # Utility functions
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗 Project Structure

```
src/
  ├── assets/          # Images, fonts, and other static files
  ├── components/       # Reusable UI components
  ├── constants/        # App constants and configurations
  ├── context/          # React context providers
  ├── hooks/            # Custom React hooks
  ├── navigation/       # Navigation configuration
  ├── screens/          # App screens
  ├── services/         # API and service integrations
  ├── theme/            # Theme and styling
  └── utils/            # Utility functions
```

## 🛠 Built With

- [React Native](https://reactnative.dev/) - Build native mobile apps using JavaScript and React
- [Expo](https://expo.dev/) - Open-source platform for making universal native apps
- [React Navigation](https://reactnavigation.org/) - Routing and navigation for React Native apps
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) - Access device location
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) - Local SQLite database
- [Victory Native](https://formidable.com/open-source/victory/) - Data visualization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by runners who want to track their progress without being tied to the cloud
- Built with the amazing React Native and Expo ecosystems
