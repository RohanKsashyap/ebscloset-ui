/**
 * Utility to append ImageKit transformations to image URLs
 * @param url The original ImageKit URL
 * @param width Optional width in pixels
 * @param height Optional height in pixels
 * @param quality Optional quality (default 80)
 * @returns Optimized URL with transformations
 */
export function getOptimizedUrl(url: string | undefined, width?: number, height?: number, quality: number = 80): string {
  if (!url) return '';
  if (!url.includes('ik.imagekit.io')) return url;

  // If the URL already has transformations, we need to handle it
  const hasTr = url.includes('?tr=') || url.includes('/tr:');
  
  // Build transformation string
  const trParts: string[] = [`q-${quality}`, 'pr-true']; // pr-true enables progressive loading
  
  if (width) trParts.push(`w-${width}`);
  if (height) trParts.push(`h-${height}`);
  
  const trString = trParts.join(',');

  // Handle different ImageKit URL structures
  if (url.includes('?')) {
    // If it has query params, append tr to existing ones or replace
    if (url.includes('tr=')) {
      return url.replace(/tr=[^&]+/, `tr=${trString}`);
    }
    return `${url}&tr=${trString}`;
  }

  // Use path-based transformation for cleaner URLs
  // Find the account name part (e.g., /rohanKashyap/)
  const parts = url.split('ik.imagekit.io/');
  if (parts.length === 2) {
    const [baseUrl, pathPart] = parts;
    const pathParts = pathPart.split('/');
    const accountName = pathParts[0];
    const restOfPath = pathParts.slice(1).join('/');
    
    return `${baseUrl}ik.imagekit.io/${accountName}/tr:${trString}/${restOfPath}`;
  }

  return `${url}?tr=${trString}`;
}
