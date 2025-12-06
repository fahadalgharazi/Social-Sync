/**
 * Allowed image hosting domains for profile pictures and event images
 * Add your trusted image hosting services here
 */
const ALLOWED_IMAGE_DOMAINS = [
  'i.imgur.com',
  'imgur.com',
  'images.unsplash.com',
  'unsplash.com',
  's-media-cache-ak0.pinimg.com',
  'i.pinimg.com',
  'gravatar.com',
  'www.gravatar.com',
  'lh3.googleusercontent.com',         // Google user content
  'avatars.githubusercontent.com',     // GitHub avatars
  'pbs.twimg.com',                     // Twitter/X images
  'abs.twimg.com',                     // Twitter/X images
  'platform-lookaside.fbsbx.com',      // Facebook CDN
  'scontent.xx.fbcdn.net',             // Facebook CDN
  'cdn.discordapp.com',                // Discord CDN
  's3.amazonaws.com',                  // AWS S3 (generic)
  'cloudinary.com',                    // Cloudinary CDN
  'images.ctfassets.net',              // Contentful CDN
  's.ticketm.net',                     // Ticketmaster images
  'media.ticketmaster.com',            // Ticketmaster images
  'cloudfront.net',                    // AWS CloudFront
  'supabase.co',                       // Supabase storage
];

/**
 * Validates if a URL is from an allowed image domain
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is from allowed domain
 */
export function isAllowedImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Allow empty string (optional field)
  if (url === '') {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check if hostname matches any allowed domain
    // Supports both exact match and subdomain match
    return ALLOWED_IMAGE_DOMAINS.some((domain) => {
      return (
        hostname === domain.toLowerCase() ||
        hostname.endsWith(`.${domain.toLowerCase()}`)
      );
    });
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

/**
 * Get list of allowed image domains (for error messages)
 * @returns {string[]} - Array of allowed domains
 */
export function getAllowedImageDomains() {
  return [...ALLOWED_IMAGE_DOMAINS];
}
