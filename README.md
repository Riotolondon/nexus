# Solus Nexus

A mobile application connecting students across South African universities, providing resources, collaboration spaces, and career opportunities.

## Setup Instructions

### Prerequisites
- Node.js (Download and install from https://nodejs.org/)
- Expo Go app on your mobile device (for testing)

### Installation Steps

1. Install Node.js from https://nodejs.org/ (LTS version recommended)
2. Open a PowerShell or Command Prompt as Administrator
3. Navigate to the project directory: 
   ```
   cd "C:\Users\USER PC\Desktop\Solus Nexus"
   ```
4. Install dependencies:
   ```
   npm install
   ```

### Running the App

1. Start the development server:
   ```
   npm start
   ```
2. Scan the QR code with your mobile device's camera
3. The app will open in Expo Go

### Troubleshooting

If you encounter network issues during installation, try setting an alternative npm registry:
```
npm config set registry https://registry.npmjs.org/
```
or
```
npm config set registry https://npm.cloudflare.com/
```

## Project Structure

- `app/` - Main application screens and navigation
- `components/` - Reusable UI components
- `constants/` - App-wide configuration and constants
- `store/` - State management using Zustand
- `assets/` - Images and other static assets 