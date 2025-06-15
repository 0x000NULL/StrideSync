# StrideSync Overview

## What is StrideSync?

StrideSync is a comprehensive running tracker application that helps athletes of all levels track, analyze, and improve their running performance. Built with a focus on cross-platform accessibility and offline functionality, StrideSync ensures your running data is always available when you need it, whether you're online or off.

## Key Features

### Multi-Platform Support
- **Web Application**: Access your running data from any browser
- **Mobile Apps**: Native iOS and Android applications for on-the-go tracking
- **Desktop Clients**: Full-featured desktop applications for Windows, macOS, and Linux

### Run Tracking
- GPS tracking of running routes
- Real-time pace and distance monitoring
- Heart rate monitoring (with compatible devices)
- Customizable run metrics and statistics
- Audio feedback during runs

### Data Synchronization
- Cloud sync across all your devices
- Offline-first architecture
- Conflict resolution for offline changes
- Secure data encryption in transit and at rest

### Performance Analysis
- Detailed run statistics and trends
- Customizable dashboards
- Training load and recovery metrics
- Goal setting and progress tracking

### Community & Sharing
- Share runs with friends
- Join challenges and leaderboards
- Export data in multiple formats (GPX, TCX, CSV)

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (cloud), SQLite (local)
- **Authentication**: JWT
- **API**: RESTful API with WebSocket support for real-time updates

### Frontend
- **Web**: React, React Query, Vanilla CSS
- **Mobile**: React Native, Expo
- **Desktop**: Electron

### Development Tools
- **Package Manager**: npm
- **Build System**: npm workspaces
- **Linting/Formatting**: ESLint, Prettier
- **Testing**: Jest, React Testing Library

## Architecture

StrideSync follows a modular architecture with clear separation of concerns:

1. **API Layer**: Handles all client requests and responses
2. **Service Layer**: Contains business logic and data processing
3. **Data Access Layer**: Manages database operations
4. **Synchronization Engine**: Handles data sync between clients and cloud
5. **Client Applications**: Platform-specific UIs that consume the API

## Getting Help

For support or questions, please refer to:
- [FAQ](../resources/faq.md)
- [Troubleshooting Guide](../resources/troubleshooting.md)
- [GitHub Issues](https://github.com/yourusername/stride-sync/issues)

## License

StrideSync is [MIT licensed](https://opensource.org/licenses/MIT).
