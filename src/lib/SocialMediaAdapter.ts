type Platform = 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin';

interface SharePayload {
  caption: string;
  mediaUrl?: string;
  link?: string;
}

interface PlatformConfig {
  url: string;
  width: number;
  height: number;
  requiresClipboard: boolean;
  displayName: string;
}

export const SocialMediaAdapter = {
  async share(platform: Platform, payload: SharePayload): Promise<Window | null> {

    const encodedCaption = encodeURIComponent(payload.caption);
    const encodedUrl = encodeURIComponent(payload.link || '');

    const platformConfigs: Record<Platform, PlatformConfig> = {
      twitter: {
        url: `https://twitter.com/intent/tweet?text=${encodedCaption}&url=${encodedUrl}`,
        width: 550,
        height: 420,
        requiresClipboard: false,
        displayName: 'X (Twitter)'
      },
      facebook: {
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedCaption}`,
        width: 600,
        height: 600,
        requiresClipboard: false,
        displayName: 'Facebook'
      },
      linkedin: {
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        width: 750,
        height: 600,
        requiresClipboard: false,
        displayName: 'LinkedIn'
      },
      instagram: {
        url: 'https://www.instagram.com/',
        width: 1000,
        height: 800,
        requiresClipboard: true,
        displayName: 'Instagram'
      },
      tiktok: {
        url: 'https://www.tiktok.com/upload',
        width: 1000,
        height: 800,
        requiresClipboard: true,
        displayName: 'TikTok'
      }
    };

    const config = platformConfigs[platform];

    const left = window.screenX + (window.outerWidth - config.width) / 2;
    const top = window.screenY + (window.outerHeight - config.height) / 2;
    
    if (config.requiresClipboard) {
      try {
        await navigator.clipboard.writeText(payload.caption);
        console.log(`${config.displayName} caption copied to clipboard.`);
      } catch (err) {
        console.warn(`Failed to copy to clipboard for ${config.displayName}:`, err);
      }
    }

    return window.open(
      config.url,
      `piko_share_${platform}`,
      `width=${config.width},height=${config.height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  },

  async blastToAll(platforms: Platform[], payload: SharePayload): Promise<void> {
    for (const platform of platforms) {
      await this.share(platform, payload);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },

  getPlatformConfig(platform: Platform): PlatformConfig {
    const configs: Record<Platform, PlatformConfig> = {
      twitter: {
        url: 'https://twitter.com/intent/tweet',
        width: 550,
        height: 420,
        requiresClipboard: false,
        displayName: 'X (Twitter)'
      },
      facebook: {
        url: 'https://www.facebook.com/sharer/sharer.php',
        width: 600,
        height: 600,
        requiresClipboard: false,
        displayName: 'Facebook'
      },
      linkedin: {
        url: 'https://www.linkedin.com/sharing/share-offsite/',
        width: 750,
        height: 600,
        requiresClipboard: false,
        displayName: 'LinkedIn'
      },
      instagram: {
        url: 'https://www.instagram.com/',
        width: 1000,
        height: 800,
        requiresClipboard: true,
        displayName: 'Instagram'
      },
      tiktok: {
        url: 'https://www.tiktok.com/upload',
        width: 1000,
        height: 800,
        requiresClipboard: true,
        displayName: 'TikTok'
      }
    };

    return configs[platform];
  }
};

export type { Platform, SharePayload, PlatformConfig };
