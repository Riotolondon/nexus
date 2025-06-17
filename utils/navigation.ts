/**
 * Navigation utilities for the app
 */

/**
 * Creates a type-safe router push/replace parameter
 * @param path The path to navigate to
 * @param params Optional parameters for the path
 * @returns A router-compatible navigation object
 */
export const createNavigation = (path: string, params?: Record<string, string | number>) => {
  if (params) {
    return {
      pathname: path as any,
      params
    };
  }
  return {
    pathname: path as any
  };
}; 