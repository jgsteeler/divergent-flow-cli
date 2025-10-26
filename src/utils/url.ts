/**
 * Normalizes a base URL by removing trailing slashes and collapsing multiple slashes.
 * This ensures that when we append paths like "/v1/version", we don't get double slashes.
 * 
 * @param url - The URL to normalize
 * @returns The normalized URL without trailing slashes
 * 
 * @example
 * normalizeBaseUrl('http://localhost:8080/') => 'http://localhost:8080'
 * normalizeBaseUrl('http://localhost:8080//') => 'http://localhost:8080'
 */
export function normalizeBaseUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') {
    return 'http://localhost:8080';
  }
  
  // Remove trailing slashes
  let normalized = url.replace(/\/+$/, '');
  
  // Collapse multiple slashes in the path (but preserve :// in protocol)
  normalized = normalized.replace(/([^:]\/)\/+/g, '$1');
  
  return normalized;
}

/**
 * Builds a full API URL by combining a base URL with a path.
 * Ensures proper slash handling between base and path.
 * 
 * @param baseUrl - The base URL (will be normalized)
 * @param path - The path to append (should start with /)
 * @returns The complete URL
 * 
 * @example
 * buildApiUrl('http://localhost:8080/', '/v1/version') => 'http://localhost:8080/v1/version'
 * buildApiUrl('http://localhost:8080', 'v1/version') => 'http://localhost:8080/v1/version'
 */
export function buildApiUrl(baseUrl: string | undefined, path: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalized}${cleanPath}`;
}
