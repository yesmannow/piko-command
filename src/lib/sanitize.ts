/**
 * Input sanitization utilities for PIKO COMMAND
 * Provides security and validation for user inputs
 */

/**
 * Sanitizes text for safe clipboard operations
 * Removes potentially dangerous content while preserving formatting
 * 
 * @param text - Raw text input from user
 * @returns Sanitized text safe for clipboard operations
 */
export function sanitizeForClipboard(text: string): string {
  if (!text) return '';
  
  // Remove null bytes and other control characters except newlines and tabs
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim excessive whitespace
  sanitized = sanitized.trim();
  
  // Remove excessive consecutive newlines (max 2)
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  return sanitized;
}

/**
 * Validates and sanitizes URLs for social media sharing
 * Ensures URLs are safe and properly formatted
 * 
 * @param url - Raw URL input
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    // Attempt to parse URL
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
    
    return parsedUrl.toString();
  } catch {
    // Invalid URL format
    return '';
  }
}

/**
 * Sanitizes platform caption to prevent injection attacks
 * Removes script tags and dangerous HTML while preserving emojis and formatting
 * 
 * @param caption - Raw caption text
 * @returns Sanitized caption safe for display and sharing
 */
export function sanitizeCaption(caption: string): string {
  if (!caption) return '';
  
  // Remove script tags and their content
  let sanitized = caption.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Trim and normalize whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validates file name for safe GitHub uploads
 * Ensures filename doesn't contain path traversal or dangerous characters
 * 
 * @param filename - Original filename
 * @returns Sanitized filename safe for filesystem operations
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  // Remove path separators and other dangerous characters
  let sanitized = filename.replace(/[/\\?%*:|"<>]/g, '-');
  
  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Ensure reasonable length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    sanitized = sanitized.substring(0, 255 - ext.length - 1) + '.' + ext;
  }
  
  return sanitized;
}

/**
 * Validates GitHub token format
 * Checks if token matches expected GitHub PAT format
 * 
 * @param token - GitHub Personal Access Token
 * @returns true if token format is valid
 */
export function isValidGitHubToken(token: string): boolean {
  if (!token) return false;
  
  // GitHub classic tokens start with ghp_, fine-grained start with github_pat_
  const classicPattern = /^ghp_[a-zA-Z0-9]{36}$/;
  const fineGrainedPattern = /^github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}$/;
  
  return classicPattern.test(token) || fineGrainedPattern.test(token);
}

/**
 * Validates YouTube API key format
 * Checks if key matches expected Google API key format
 * 
 * @param apiKey - YouTube Data API key
 * @returns true if key format is valid
 */
export function isValidYouTubeApiKey(apiKey: string): boolean {
  if (!apiKey) return false;
  
  // Google API keys are typically 39 characters, alphanumeric with hyphens and underscores
  const pattern = /^[a-zA-Z0-9_-]{20,50}$/;
  
  return pattern.test(apiKey);
}
