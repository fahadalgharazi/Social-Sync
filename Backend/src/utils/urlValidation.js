const ALLOWED_IMAGE_DOMAINS = [
  'i.imgur.com',
  'imgur.com',
  'images.unsplash.com',
  'unsplash.com',
  's-media-cache-ak0.pinimg.com',
  'i.pinimg.com',
  'gravatar.com',
  'www.gravatar.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'pbs.twimg.com',
  'abs.twimg.com',
  'platform-lookaside.fbsbx.com',
  'scontent.xx.fbcdn.net',
  'cdn.discordapp.com',
  's3.amazonaws.com',
  'cloudinary.com',
  'images.ctfassets.net',
  's.ticketm.net',
  'media.ticketmaster.com',
  'cloudfront.net',
  'supabase.co',
];

export function isAllowedImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  if (url === '') {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return ALLOWED_IMAGE_DOMAINS.some((domain) => {
      return (
        hostname === domain.toLowerCase() ||
        hostname.endsWith(`.${domain.toLowerCase()}`)
      );
    });
  } catch (error) {
    return false;
  }
}

export function getAllowedImageDomains() {
  return [...ALLOWED_IMAGE_DOMAINS];
}
