// Client-side CSRF utilities
import { useEffect, useState } from 'react';

const CSRF_TOKEN_KEY = 'csrf-token';

/**
 * Get CSRF token from meta tag or generate new one
 * Note: This function is client-side only. For SSR, returns undefined to avoid crashes.
 * CSRF tokens should be provided via meta tags or httpOnly cookies for security.
 */
export function getCsrfToken(): string | undefined {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // SSR context - return undefined to avoid crashes
    return undefined;
  }

  // Try to get from meta tag first (server-provided, most secure)
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag && metaTag.getAttribute('content')) {
    return metaTag.getAttribute('content')!;
  }
  
  // Try from sessionStorage (more secure than localStorage, cleared on tab close)
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (storedToken) {
    return storedToken;
  }
  
  // Generate new token if none exists (client-side fallback)
  // Note: This is less secure than server-side generation via httpOnly cookies
  const newToken = generateCsrfToken();
  // Store in sessionStorage instead of localStorage for better security
  sessionStorage.setItem(CSRF_TOKEN_KEY, newToken);
  return newToken;
}

/**
 * Generate a CSRF token (client-side fallback)
 * Note: This is less secure than server-side generation
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  const timestamp = Date.now().toString();
  return `${token}.${timestamp}`;
}

/**
 * Add CSRF token to fetch options
 */
export function addCsrfTokenToFetchOptions(options: RequestInit = {}): RequestInit {
  const token = getCsrfToken();
  if (!token) {
    // No token available, return options unchanged
    return options;
  }
  
  const headers = new Headers(options.headers);
  
  // Add CSRF token to headers
  headers.set('X-CSRF-Token', token);
  
  return {
    ...options,
    headers,
  };
}

/**
 * Custom hook for CSRF token management
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string>(() => getCsrfToken() ?? '');

  useEffect(() => {
    // Initialize token synchronously to avoid race condition on first render
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      setToken(csrfToken);
    }
  }, []);

  const refreshToken = () => {
    // First check if a meta-tag token exists (server-provided, highest priority)
    const metaToken = typeof window !== 'undefined' 
      ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      : null;
    
    if (metaToken) {
      setToken(metaToken);
      return metaToken;
    }

    // Otherwise generate a new client-side token
    const newToken = generateCsrfToken();
    // Store in sessionStorage for better security
    sessionStorage.setItem(CSRF_TOKEN_KEY, newToken);
    setToken(newToken);
    return newToken;
  };

  return { token, refreshToken };
}

/**
 * Add CSRF token to FormData
 */
export function addCsrfTokenToFormData(formData: FormData): FormData {
  const token = getCsrfToken();
  if (token) {
    formData.append('csrf-token', token);
  }
  return formData;
}
