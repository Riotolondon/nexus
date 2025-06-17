$BunPath = "C:\Users\USER PC\.bun\bin\bun.exe"

# Change to the project directory
Set-Location -Path "C:\Users\USER PC\Desktop\Solus Nexus"

# Run the Expo application
& $BunPath "node_modules/expo/bin/cli" start 