import type { PlatformConnection } from './auth'
import { AuthService } from './auth'

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

interface SocialConnections {
  twitter?: PlatformConnection
  instagram?: PlatformConnection
  tiktok?: PlatformConnection
  facebook?: PlatformConnection
  linkedin?: PlatformConnection
}

export const SocialMediaAdapter = {
  async getConnections(): Promise<SocialConnections> {
    try {
      const connections = await window.spark.kv.get<SocialConnections>('social-connections')
      return connections || {}
    } catch {
      return {}
    }
  },

  async postViaAPI(platform: Platform, payload: SharePayload, connection: PlatformConnection): Promise<boolean> {
    if (!connection.credentials) {
      return false
    }

    try {
      switch (platform) {
        case 'twitter':
          return await this.postToTwitter(payload, connection)
        case 'instagram':
          return await this.postToInstagram(payload, connection)
        case 'tiktok':
          return await this.postToTikTok(payload, connection)
        case 'facebook':
          return await this.postToFacebook(payload, connection)
        case 'linkedin':
          return await this.postToLinkedIn(payload, connection)
        default:
          return false
      }
    } catch (error) {
      console.error(`API post to ${platform} failed:`, error)
      return false
    }
  },

  async postToTwitter(payload: SharePayload, connection: PlatformConnection): Promise<boolean> {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.credentials?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: payload.caption
      })
    })

    return response.ok
  },

  async postToInstagram(payload: SharePayload, connection: PlatformConnection): Promise<boolean> {
    console.log('Instagram API posting not yet implemented - using fallback')
    return false
  },

  async postToTikTok(payload: SharePayload, connection: PlatformConnection): Promise<boolean> {
    console.log('TikTok API posting not yet implemented - using fallback')
    return false
  },

  async postToFacebook(payload: SharePayload, connection: PlatformConnection): Promise<boolean> {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.credentials?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: payload.caption,
        link: payload.link
      })
    })

    return response.ok
  },

  async postToLinkedIn(payload: SharePayload, connection: PlatformConnection): Promise<boolean> {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.credentials?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: `urn:li:person:${connection.credentials?.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: payload.caption
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    })

    return response.ok
  },

  async share(platform: Platform, payload: SharePayload): Promise<Window | null> {
    const connections = await this.getConnections()
    const connection = connections[platform]

    if (connection?.connected && connection.credentials) {
      const apiSuccess = await this.postViaAPI(platform, payload, connection)
      
      if (apiSuccess) {
        console.log(`Successfully posted to ${platform} via API`)
        return null
      }
      
      console.log(`API post failed for ${platform}, falling back to browser intent`)
    }

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
