import { logger } from './logger';

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

// Centralized platform configuration
const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
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

export const SocialMediaAdapter = {
  async share(platform: Platform, payload: SharePayload): Promise<Window | null> {
    const config = PLATFORM_CONFIGS[platform];
    
    if (!config) {
      logger.error(`Unknown platform: ${platform}`);
      return null;
    }

    const encodedCaption = encodeURIComponent(payload.caption);
    const encodedUrl = encodeURIComponent(payload.link || '');

    // Build platform-specific URL
    let shareUrl = config.url;
    if (!config.requiresClipboard) {
      switch (platform) {
        case 'twitter':
          shareUrl = `${config.url}?text=${encodedCaption}&url=${encodedUrl}`;
          break;
        case 'facebook':
          shareUrl = `${config.url}?u=${encodedUrl}&quote=${encodedCaption}`;
          break;
        case 'linkedin':
          shareUrl = `${config.url}?url=${encodedUrl}`;
          break;
      }
    }

    // Center the popup window
    const left = window.screenX + (window.outerWidth - config.width) / 2;
    const top = window.screenY + (window.outerHeight - config.height) / 2;
    
    // Copy to clipboard for platforms that require it
    if (config.requiresClipboard) {
      try {
        await navigator.clipboard.writeText(payload.caption);
        logger.social(platform, 'clipboard_copy', true);
      } catch (err) {
        logger.social(platform, 'clipboard_copy', false);
        // Don't block the share flow if clipboard fails
      }
    }

    const popup = window.open(
      shareUrl,
      `piko_share_${platform}`,
      `width=${config.width},height=${config.height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    logger.social(platform, 'share_window_opened', !!popup);
    return popup;
  },

  async blastToAll(platforms: Platform[], payload: SharePayload): Promise<void> {
    logger.info(`Blasting to ${platforms.length} platforms`, {
      component: 'SocialMediaAdapter',
      metadata: { platforms }
    });

    for (const platform of platforms) {
      await this.share(platform, payload);
      // Small delay to prevent popup blocking
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    logger.info('Blast complete');
  },

  getPlatformConfig(platform: Platform): PlatformConfig {
    return PLATFORM_CONFIGS[platform];
  }
};

export type { Platform, SharePayload, PlatformConfig };
