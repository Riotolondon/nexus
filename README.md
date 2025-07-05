# Solus Nexus

A mobile application connecting students across South African universities, providing resources, collaboration spaces, and career opportunities.

## Features

- **Academic Resources**: Share and access study materials, notes, and resources
- **Collaboration Spaces**: Create or join study groups and project teams
- **Career Opportunities**: Discover internships, part-time jobs, and graduate programs
- **University-specific Content**: Tailored resources for your institution

## Setup Instructions

### Prerequisites
- Node.js (Download and install from https://nodejs.org/)
- Expo Go app on your mobile device (for testing)
- Supabase account

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

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

### Supabase Authentication Issues

If you encounter errors during user registration or login, try the following solutions:

#### 1. UUID Format Error

If you see: `invalid input syntax for type uuid: "uct"`

Run the university migration script:
```
./run-university-migration.ps1
```

#### 2. Row Level Security (RLS) Error

If you see: `new row violates row-level security policy for table "users"`

This is a common issue with Supabase's Row Level Security. Follow these steps to fix it:

1. **Option 1: Disable RLS temporarily** (fastest solution)
   - Go to your [Supabase Dashboard](https://app.supabase.io/)
   - Navigate to "Table Editor" → "users" table
   - Click "RLS" button at the top and turn it OFF
   - Try registering again
   - *Remember to turn RLS back ON after testing*

2. **Option 2: Add a stored procedure** (better for production)
   - Go to your Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase/create_user_procedure.sql`
   - Run the SQL
   - This creates a function that bypasses RLS when creating users

3. **Option 3: Add an RLS policy** (best practice)
   - Go to your Supabase Dashboard → SQL Editor
   - Run the following SQL:
   ```sql
   CREATE POLICY "Allow inserts to users table" ON public.users
       FOR INSERT
       WITH CHECK (true);
   ```

If you're still having issues, check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) file for more detailed troubleshooting.

#### 3. Undefined User ID Error

If you see: `invalid input syntax for type uuid: "undefined"`

This usually happens when the app tries to load a user profile but the user ID is undefined. Try:
- Clearing your browser cache
- Signing out and signing back in
- Checking your Supabase database for valid user entries

## Project Structure

- `app/` - Main application screens and navigation
- `components/` - Reusable UI components
- `constants/` - App-wide configuration and constants
- `store/` - State management using Zustand
- `assets/` - Images and other static assets 

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 