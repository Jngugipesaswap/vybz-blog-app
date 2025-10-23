/**
 * UTM Parameter Builder for tracking social shares
 */

export interface UTMParams {
  source: string; // e.g., 'facebook', 'twitter', 'whatsapp'
  medium: string; // e.g., 'social', 'email', 'referral'
  campaign?: string; // e.g., 'summer-events', 'new-year-promo'
  content?: string; // e.g., 'event-123', 'venue-456'
  term?: string; // e.g., keywords for paid search
}

/**
 * Build a URL with UTM parameters
 */
export const buildUTMUrl = (baseUrl: string, params: UTMParams): string => {
  const url = new URL(baseUrl);
  
  // Add UTM parameters
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  
  if (params.campaign) {
    url.searchParams.set('utm_campaign', params.campaign);
  }
  
  if (params.content) {
    url.searchParams.set('utm_content', params.content);
  }
  
  if (params.term) {
    url.searchParams.set('utm_term', params.term);
  }
  
  return url.toString();
};

/**
 * Parse UTM parameters from URL
 */
export const parseUTMParams = (url: string): Partial<UTMParams> | null => {
  try {
    const urlObj = new URL(url);
    const params: Partial<UTMParams> = {};
    
    const source = urlObj.searchParams.get('utm_source');
    const medium = urlObj.searchParams.get('utm_medium');
    const campaign = urlObj.searchParams.get('utm_campaign');
    const content = urlObj.searchParams.get('utm_content');
    const term = urlObj.searchParams.get('utm_term');
    
    if (source) params.source = source;
    if (medium) params.medium = medium;
    if (campaign) params.campaign = campaign;
    if (content) params.content = content;
    if (term) params.term = term;
    
    return Object.keys(params).length > 0 ? params : null;
  } catch {
    return null;
  }
};

/**
 * Get platform-specific UTM source names
 */
export const getPlatformSource = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'whatsapp': 'whatsapp',
    'twitter': 'twitter',
    'facebook': 'facebook',
    'linkedin': 'linkedin',
    'instagram': 'instagram',
    'instagram_story': 'instagram_story',
    'snapchat': 'snapchat',
    'snapchat_story': 'snapchat_story',
    'facebook_story': 'facebook_story',
    'copy_link': 'direct',
    'qr_code': 'qr_code',
    'email': 'email'
  };
  
  return platformMap[platform] || platform;
};
