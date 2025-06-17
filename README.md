# 🏃‍♂️ StrideSync – Run Tracking & Shoe Management

A modern running tracker and shoe management app built with React Native (Expo). Track your runs, monitor shoe mileage, and analyze your running statistics with a clean, intuitive interface.

## 🚀 Features (Implemented)

### 🏃 Run Tracking
- [x] Record and save run details
- [x] Track distance, duration, and pace
- [x] Run history with filtering and sorting
- [x] Search runs by notes, location, or shoe

### 👟 Shoe Management
- [x] Track multiple pairs of shoes
- [x] Automatic mileage tracking
- [x] Shoe usage statistics
- [x] Active/retired status

### 🔍 Advanced Features
- [x] Powerful search functionality
- [x] Custom date range filters
- [x] Multiple sorting options
- [x] Pull-to-refresh

### 🎨 User Experience
- [x] Dark/Light theme support
- [x] Skeleton loading states
- [x] Error handling with retry options
- [x] Smooth animations and transitions

### 🛠 Technical Stack
- React Native (Expo)
- Zustand for state management
- AsyncStorage for data persistence
- React Navigation
- date-fns for date handling

## 🛠 Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm (v9+) or yarn (v1.22+)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator or a physical device with the Expo Go app

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/0x000NULL/StrideSync.git
   cd StrideSync
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

4. Run the app:
   - Scan the QR code with the Expo Go app (iOS/Android)
   - Press 'i' for iOS Simulator
   - Press 'a' for Android Emulator
   - Press 'w' for web browser

### Development Scripts

- `yarn start` - Start the development server
- `yarn android` - Run on Android device/emulator
- `yarn ios` - Run on iOS simulator
- `yarn web` - Run in web browser
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## 📚 Project Structure

```
src/
├── assets/           # Images, fonts, and other static files
├── components/       # Reusable UI components
│   ├── common/      # Common UI elements
│   └── runs/        # Run-specific components
├── constants/        # App constants and configurations
├── hooks/            # Custom React hooks
├── navigation/       # Navigation configuration
├── screens/          # App screens
│   ├── RunLogScreen/
│   ├── RunDetailsScreen/
│   └── ShoeListScreen/
├── services/         # Data services
│   └── storage.js    # AsyncStorage wrapper
├── stores/           # Zustand stores
│   ├── runStore.js   # Run state management
│   ├── shoeStore.js  # Shoe state management
│   └── index.js      # Store exports
├── theme/            # Theming and styling
│   ├── colors.js     # Color palette
│   ├── spacing.js    # Spacing system
│   └── typography.js # Typography system
└── utils/            # Utility functions
    ├── date.js       # Date helpers
    └── formatters.js # Data formatting
```

### State Management

The app uses [Zustand](https://github.com/pmndrs/zustand) for state management with the following stores:

- `runStore`: Manages run data and statistics
- `shoeStore`: Handles shoe data and mileage tracking

### Theming

The app supports light and dark themes with a consistent design system:

- Colors
- Typography
- Spacing
- Border radiuses
- Shadows

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

## 🛠 Built With

- [React Native](https://reactnative.dev/) - Native mobile apps with JavaScript
- [Expo](https://expo.dev/) - Universal native apps platform
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Navigation](https://reactnavigation.org/) - Routing and navigation
- [date-fns](https://date-fns.org/) - Modern date utility library
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Smooth animations

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the amazing React Native and Expo ecosystems
- Inspired by the running community's need for simple, effective tracking tools
