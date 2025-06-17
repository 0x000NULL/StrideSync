# Development Setup

This guide will help you set up the development environment for StrideSync.

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or Yarn
- Expo CLI (`npm install -g expo-cli`)
- Git
- A code editor (VS Code recommended)
- Android Studio / Xcode (for mobile development)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stride-sync-app.git
   cd stride-sync-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables as needed

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

## Project Structure

```
src/
├── assets/           # Images, fonts, and other static files
├── components/       # Reusable UI components
│   ├── ui/          # Basic UI components (buttons, inputs, etc.)
│   └── ...
├── navigation/      # Navigation configuration (React Navigation)
│   ├── AppNavigator.js
│   └── navigationTheme.js
├── screens/         # Screen components
│   ├── HomeScreen/
│   ├── RunLogScreen/
│   └── ...
├── stores/          # State management (Zustand)
│   ├── runStore.js
│   ├── shoeStore.js
│   ├── settingsStore.js
│   └── index.js
├── theme/           # Theming and styling
│   ├── colors.js
│   ├── spacing.js
│   └── typography.js
└── utils/           # Utility functions
    ├── formatters.js
    └── validators.js
  │   ├── runStore.js
  │   ├── shoeStore.js
  │   ├── settingsStore.js
  │   └── index.js
  ├── theme/           # Theming and styling
  └── utils/           # Utility functions
```

## Development Workflow

1. **Branching Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch
   - `feature/*`: New features
   - `bugfix/*`: Bug fixes
   - `release/*`: Release preparation

2. **Code Style**
   - Follow the existing code style
   - Use Prettier for code formatting
   - Follow the ESLint rules

3. **Commits**
   - Use conventional commit messages
   - Keep commits focused and atomic
   - Reference issues in commit messages when applicable

## Testing

Run tests with:
```bash
npm test
```

## Building for Production

### Android
```bash
expo build:android
```

iOS
```bash
expo build:ios
```

## Troubleshooting

- **iOS Build Issues**: Make sure you have the latest Xcode and CocoaPods
- **Android Emulator Issues**: Ensure Android Studio and emulator are properly set up
- **Package Installation Issues**: Try clearing the cache with `npm start -- --clear`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---
*Next: [Project Structure →](./project-structure.md)*
