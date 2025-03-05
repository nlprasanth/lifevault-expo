# LifeVault - Expo

A secure document and recording management app built with Expo.

## Features

- Document Management
  - View, edit, and delete documents
  - Share documents securely
  - Support for multiple file types
- Voice Recording
  - Record and store voice notes
  - Playback recordings
  - Share recordings
- Secure Storage
  - Encrypted file storage
  - Secure file sharing
  - Biometric authentication
- Modern UI
  - Clean and intuitive interface
  - Dark mode support
  - Responsive design

## Prerequisites

- Node.js 14.0 or later
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lifevault-expo.git
cd lifevault-expo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your device:
- Scan the QR code with the Expo Go app
- Press 'i' for iOS simulator
- Press 'a' for Android emulator

## Project Structure

```
lifevault-expo/
├── src/
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   └── assets/           # Images, fonts, etc.
├── App.tsx               # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies and scripts
```

## Expo Configuration

The app uses the following Expo features and plugins:
- expo-document-picker: For selecting documents
- expo-file-system: For managing files
- expo-av: For audio recording and playback
- expo-sharing: For sharing files
- expo-local-authentication: For biometric authentication
- @react-native-async-storage/async-storage: For settings persistence

## Development

- `npx expo start` - Start the development server
- `npx expo start --android` - Run on Android
- `npx expo start --ios` - Run on iOS
- `npx expo start --web` - Run in web browser

## Building for Production

1. Build for Android:
```bash
eas build -p android
```

2. Build for iOS:
```bash
eas build -p ios
```

3. Submit to stores:
```bash
eas submit -p android
eas submit -p ios
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
