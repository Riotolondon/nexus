/**
 * Type definitions for app routes
 */

// Define app route structure
export type AppRoutes = {
  // Root routes
  '/': undefined;
  '(tabs)': undefined;
  
  // Auth routes
  'auth/login': undefined;
  'auth/signup': undefined;
  
  // Dynamic routes
  'academic/[id]': { id: string };
  'career/[id]': { id: string };
  'collaboration/[id]': { id: string };
};

// Helper type for route paths
export type AppRoutePath = keyof AppRoutes;

// Helper function to safely navigate to a typed route
export const createTypedNavigation = <T extends AppRoutePath>(
  path: T, 
  params?: AppRoutes[T]
) => {
  if (params) {
    return { pathname: path, params };
  }
  return path;
}; 