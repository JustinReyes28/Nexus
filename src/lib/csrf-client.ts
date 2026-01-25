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
 * Result type for CSRF token addition
 */
export type CsrfFetchOptionsResult = {
  options: RequestInit;
  tokenMissing: boolean;
};

/**
 * Add CSRF token to fetch options
 * @returns An object containing the updated options and a tokenMissing flag to indicate if the CSRF token was missing
 * Usage:
 *   const result = addCsrfTokenToFetchOptions(options);
 *   if (result.tokenMissing) {
 *     // Handle missing token case
 *   }
 *   return fetch(url, result.options);
 */
export function addCsrfTokenToFetchOptions(options: RequestInit = {}): CsrfFetchOptionsResult {
  const token = getCsrfToken();
  if (!token) {
    // No token available, return options unchanged but indicate token is missing
    if (process.env.NODE_ENV !== 'production') {
      console.warn('CSRF token is missing. Requests may fail due to CSRF protection.');
    }
    return {
      options,
      tokenMissing: true
    };
  }
  
  const headers = new Headers(options.headers);
  
  // Add CSRF token to headers
  headers.set('X-CSRF-Token', token);
  
  return {
    options: {
      ...options,
      headers,
    },
    tokenMissing: false
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
    
    // Update component state with the new token
    setToken(newToken);
    
    // Only store in sessionStorage on the client side to avoid SSR errors
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      // Store in sessionStorage for better security
      sessionStorage.setItem(CSRF_TOKEN_KEY, newToken);
    }
    
    return newToken;
  };

  return { token, refreshToken };
}

/**
 * Add CSRF token to FormData
 * @returns An object containing the updated formData and a tokenMissing flag to indicate if the CSRF token was missing
 * Usage:
 *   const result = addCsrfTokenToFormData(formData);
 *   if (result.tokenMissing) {
 *     // Handle missing token case
 *   }
 *   // Use result.formData for submission
 */
export function addCsrfTokenToFormData(formData: FormData): { formData: FormData, tokenMissing: boolean } {
  const token = getCsrfToken();
  if (!token) {
    // No token available, return formData unchanged but indicate token is missing
    if (process.env.NODE_ENV !== 'production') {
      console.warn('CSRF token is missing. Requests may fail due to CSRF protection.');
    }
    return {
      formData,
      tokenMissing: true
    };
  }
  
  formData.append('csrf-token', token);
  return {
    formData,
    tokenMissing: false
  };
}
