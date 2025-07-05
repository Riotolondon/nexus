# 🚀 Supabase Setup for Solus Nexus

## Why Supabase Over Firebase?

### **Advantages for Your App:**
- ✅ **Real SQL Database** - PostgreSQL with complex queries
- ✅ **Better Cost Structure** - No per-operation charges
- ✅ **Superior Developer Experience** - Auto-generated APIs
- ✅ **Open Source** - No vendor lock-in
- ✅ **Real-time with SQL** - Best of both worlds
- ✅ **Built-in Row Level Security** - Enterprise-grade security

## 📋 Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Node.js** - Version 16 or higher
3. **Expo CLI** - For React Native development

## 🛠️ Step 1: Installation

Add Supabase to your project:

```bash
npm install @supabase/supabase-js
```

Update your `package.json` dependencies:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    // ... your existing dependencies
  }
}
```

## 🏗️ Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a **project name**: `solus-nexus`
3. Set a **strong database password**
4. Select **region** closest to South Africa (Europe West recommended)
5. Wait for the project to be created (2-3 minutes)

## 🗄️ Step 3: Set Up Database Schema

1. Go to your Supabase dashboard → **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run** to create all tables and policies
4. Verify tables are created in **Table Editor**

### **Key Tables Created:**
- `users` - User profiles with university information
- `universities` - South African universities data
- `collaboration_spaces` - Study groups and project teams
- `collaboration_participants` - Many-to-many relationship
- `messages` - Real-time messaging
- `career_opportunities` - Job and internship listings
- `academic_resources` - Shared study materials
- `notifications` - User notifications
- `user_bookmarks` - Saved items

## 🔐 Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: For development
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Get your credentials from:**
1. Supabase Dashboard → Settings → API
2. Copy `Project URL` and `Project API Key (anon public)`

## ⚙️ Step 5: Update Supabase Service

Update `utils/supabaseService.ts` with your credentials:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
```

## 🔄 Step 6: Migration from Firebase

### **Replace Firebase Store Imports:**

**Before (Firebase):**
```typescript
import { useUserStore } from "./store/useUserStore";
```

**After (Supabase):**
```typescript
import { useSupabaseUserStore } from "./store/useSupabaseUserStore";
```

### **Update Login Components:**

**In `app/auth/login.tsx`:**
```typescript
// Replace this
const { login } = useUserStore();

// With this
const { signIn } = useSupabaseUserStore();

// Update login handler
const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please fill in all fields");
    return;
  }

  setIsLoading(true);
  try {
    const success = await signIn(email, password);
    if (success) {
      router.replace("/(tabs)");
    }
  } catch (error: any) {
    Alert.alert("Error", error.message);
  } finally {
    setIsLoading(false);
  }
};
```

**In `app/auth/signup.tsx`:**
```typescript
// Replace this
const { register } = useUserStore();

// With this
const { signUp } = useSupabaseUserStore();

// Update signup handler
const handleSignUp = async () => {
  // ... validation code ...
  
  try {
    const success = await signUp({
      email,
      password,
      name,
      university_id: selectedUniversityId,
      study_level: "undergraduate",
      field_of_study: "General",
      interests: [],
      bio: ""
    });
    
    if (success) {
      router.replace("/auth/interests");
    }
  } catch (error: any) {
    Alert.alert("Error", error.message);
  }
};
```

## 🎯 Step 7: Advanced Features

### **Real-time Collaboration Spaces:**

```typescript
// In your collaboration component
import { dbService } from '../utils/supabaseService';

// Subscribe to real-time updates
useEffect(() => {
  const subscription = dbService.subscribeToCollaborationSpaces((payload) => {
    console.log('Space updated:', payload);
    // Update your local state
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### **Advanced Search with SQL:**

```typescript
// Search across multiple tables
const searchEverything = async (query: string) => {
  const { data, error } = await supabase
    .rpc('search_all_content', { search_query: query });
  
  return data;
};
```

### **File Storage for Profile Pictures:**

```typescript
import { supabaseUtils } from '../utils/supabaseService';

const uploadProfilePicture = async (file: any, userId: string) => {
  const path = `profiles/${userId}/avatar.jpg`;
  
  await supabaseUtils.uploadFile('avatars', path, file);
  const publicUrl = supabaseUtils.getPublicUrl('avatars', path);
  
  // Update user profile with new image URL
  await dbService.updateUser(userId, {
    profile_image_url: publicUrl
  });
};
```

## 🔍 Step 8: Testing Your Setup

1. **Authentication Test:**
```typescript
// Create a test user
const testSignUp = async () => {
  try {
    const result = await signUp({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      university_id: "uct-id-here"
    });
    console.log("Test successful:", result);
  } catch (error) {
    console.error("Test failed:", error);
  }
};
```

2. **Database Test:**
```typescript
// Test collaboration space creation
const testCreateSpace = async () => {
  const space = await dbService.createCollaborationSpace({
    title: "Test Study Group",
    description: "Testing Supabase integration",
    university_ids: ["uct-id"],
    tags: ["test", "computer-science"],
    creator_id: "user-id-here"
  });
  console.log("Space created:", space);
};
```

## 🚀 Step 9: Deployment Considerations

### **Environment Variables for Production:**

**Expo Environment:**
```javascript
// app.config.js
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
```

**Access in app:**
```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
```

### **Security Best Practices:**

1. **Row Level Security** - Already configured in schema
2. **Environment Variables** - Never commit credentials
3. **API Key Rotation** - Rotate keys regularly
4. **Rate Limiting** - Configure in Supabase dashboard

## 📊 Step 10: Monitoring & Analytics

### **Built-in Analytics:**
- Dashboard → Analytics
- Real-time database activity
- User authentication metrics
- API usage tracking

### **Custom Events:**
```typescript
// Track user actions
const trackEvent = async (event: string, data: any) => {
  await supabase
    .from('analytics')
    .insert({
      event_name: event,
      event_data: data,
      user_id: currentUser?.id,
      timestamp: new Date().toISOString()
    });
};
```

## 🆚 Firebase vs Supabase Comparison

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | NoSQL (Firestore) | PostgreSQL (SQL) |
| Real-time | ✅ | ✅ |
| Authentication | ✅ | ✅ |
| File Storage | ✅ | ✅ |
| Complex Queries | ❌ Limited | ✅ Full SQL |
| Cost Structure | Per operation | Per usage |
| Open Source | ❌ | ✅ |
| Self-hosting | ❌ | ✅ |
| Learning Curve | Medium | Low (if you know SQL) |

## 🐛 Troubleshooting

### **Common Issues:**

1. **RLS Policies Not Working:**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'your_table';

-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

2. **Auth Session Issues:**
```typescript
// Clear auth state
await supabase.auth.signOut();
await AsyncStorage.clear();
```

3. **CORS Issues (Web):**
```typescript
// Check your domain is added in Supabase dashboard
// Authentication → URL Configuration
```

## 🚨 Troubleshooting Common Issues

### UUID Format for University IDs

If you encounter an error like `invalid input syntax for type uuid: "uct"` during user registration, it means there's a mismatch between the university IDs in your constants and the UUIDs expected by the database.

**The Problem:**
- The database expects university IDs to be in UUID format (e.g., `11111111-1111-1111-1111-111111111111`)
- But your constants file uses short string IDs (e.g., `"uct"`)

**To Fix This Issue:**

1. Run the university migration script to ensure your database has the correct universities with proper UUIDs:
   ```powershell
   ./run-university-migration.ps1
   ```

2. Make sure your `constants/universities.ts` includes both the short ID and UUID:
   ```typescript
   export const universities = [
     {
       id: "uct",
       uuid: "11111111-1111-1111-1111-111111111111",
       name: "University of Cape Town",
       // other properties...
     },
     // other universities...
   ];
   ```

3. When registering users, always use the UUID, not the short ID:
   ```typescript
   const university_id = universities[0].uuid; // Use .uuid, not .id
   ```

This ensures compatibility between your frontend constants and the database's UUID requirements.

### Row Level Security (RLS) Policy Violation

If you encounter an error like `new row violates row-level security policy for table "users"` during user registration, it means your Supabase database has RLS policies that are preventing the insertion of new user records.

**The Problem:**
- Supabase uses Row Level Security (RLS) to control access to tables
- By default, tables with RLS enabled block all operations unless specific policies allow them
- Your users table has RLS enabled but no policy for inserting new users during signup

**To Fix This Issue:**

1. Run the RLS fix script to add the necessary policies:
   ```powershell
   ./run-university-migration.ps1
   ```
   This script also applies the RLS fix.

2. Alternatively, you can manually add the policy in the Supabase SQL editor:
   ```sql
   -- Create policy to allow service role to insert users
   CREATE POLICY "Service role can insert users" ON users
       FOR INSERT
       WITH CHECK (true);
   ```

3. If you're still having issues, you can temporarily disable RLS for the users table (not recommended for production):
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```

Remember to re-enable RLS before deploying to production:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🎯 Next Steps

1. **Complete the migration** by updating all Firebase references
2. **Test thoroughly** with real data
3. **Set up proper error handling** and logging
4. **Configure backups** in Supabase dashboard
5. **Monitor performance** and optimize queries
6. **Add more advanced features** like full-text search

---

## 💡 Pro Tips

- **Use database functions** for complex business logic
- **Leverage PostgreSQL extensions** (like fuzzy text search)
- **Set up proper indexes** for performance
- **Use TypeScript types** generated from your schema
- **Implement proper error boundaries** in your React components

Your Supabase setup is now ready for production! 🎉 