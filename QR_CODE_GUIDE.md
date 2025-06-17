# QR Code Connection Guide

## Connecting to the Development Server

When running the Expo development server, you have several options to connect to your app:

### Option 1: Scan the QR Code

1. Make sure your device and development computer are on the same network
2. Open the Expo Go app on your device
3. Tap "Scan QR Code" and scan the QR code displayed in the terminal
4. If the QR code scan fails, try Option 2 or 3 below

### Option 2: Enter the URL Manually

1. Open the Expo Go app on your device
2. Tap "Enter URL manually"
3. Enter the URL shown in the terminal (usually something like `exp://192.168.x.x:19000`)
4. Tap "Connect"

### Option 3: Use Tunnel Connection

If you're having trouble connecting over LAN:

1. Stop the current development server (Ctrl+C)
2. Restart with tunnel option: `npx expo start --tunnel`
3. This will create a tunnel URL that works even if your device is on a different network
4. Scan the new QR code or enter the tunnel URL manually

### Option 4: Use Web Browser

1. Press 'w' in the terminal running the Expo server
2. This will open the app in your web browser
3. Note: Not all features may work in the web version

### Troubleshooting Connection Issues

1. **Network Issues**: Ensure both devices are on the same network or use tunnel mode
2. **Firewall Problems**: Check if your firewall is blocking the connection
3. **Expo Go App**: Make sure you have the latest version of Expo Go installed
4. **Port Conflicts**: If port 19000 is already in use, Expo will try to use another port
5. **VPN Interference**: VPNs can sometimes interfere with local network discovery

### Specific Android Troubleshooting

1. Make sure "Developer Mode" is enabled on your device
2. Enable "USB Debugging" in Developer Options
3. If using a USB connection, run `adb reverse tcp:19000 tcp:19000` to forward ports

### Specific iOS Troubleshooting

1. Make sure your iOS device is not in Low Power Mode
2. Check that your iOS device has the latest version of Expo Go
3. iOS devices may require additional permissions for local network access

If you continue to have issues, try restarting both your development computer and your mobile device. 