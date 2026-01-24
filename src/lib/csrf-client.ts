// Client-side CSRF utilities
import { useEffect, useState } from 'react';

const CSRF_TOKEN_KEY = 'csrf-token';

/**
 * Get CSRF token from meta tag or generate new one
 */
export function getCsrfToken(): string {
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag && metaTag.getAttribute('content')) {
    return metaTag.getAttribute('content')!;
  }
  
  // Try from localStorage
  const storedToken = localStorage.getItem(CSRF_TOKEN_KEY);
  if (storedToken) {
    return storedToken;
  }
  
  // Generate new token if none exists
  const newToken = generateCsrfToken();
  localStorage.setItem(CSRF_TOKEN_KEY, newToken);
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
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    setToken(getCsrfToken());
  }, []);

  const refreshToken = () => {
    const newToken = generateCsrfToken();
    localStorage.setItem(CSRF_TOKEN_KEY, newToken);
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
  formData.append('csrf-token', token);
  return formData;
}
