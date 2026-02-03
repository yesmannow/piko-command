import type { SocialMediaTokens } from '@/components/SocialMediaAuth'

export interface PostContent {
  caption: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  mediaFile?: File
  coverImageUrl?: string
}

export interface PostResult {
  platform: string
  success: boolean
  postId?: string
  url?: string
  error?: string
}

export class SocialMediaAPI {
  private tokens: SocialMediaTokens

  constructor(tokens: SocialMediaTokens) {
    this.tokens = tokens
  }

  async postToInstagram(content: PostContent): Promise<PostResult> {
    if (!this.tokens.instagram) {
      return {
        platform: 'instagram',
        success: false,
        error: 'Instagram not connected'
      }
    }

    try {
      const { accessToken, userId } = this.tokens.instagram

      let mediaId: string

      if (content.mediaFile && content.mediaType === 'image') {
        const uploadResponse = await fetch(
          `https://graph.facebook.com/v18.0/${userId}/media`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image_url: content.mediaUrl,
              caption: content.caption,
              access_token: accessToken
            })
          }
        )

        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error?.message || 'Image upload failed')
        }
        mediaId = uploadData.id
      } else if (content.mediaFile && content.mediaType === 'video') {
        const uploadResponse = await fetch(
          `https://graph.facebook.com/v18.0/${userId}/media`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              video_url: content.mediaUrl,
              caption: content.caption,
              media_type: 'REELS',
              access_token: accessToken
            })
          }
        )

        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error?.message || 'Video upload failed')
        }
        mediaId = uploadData.id
      } else {
        throw new Error('Media file and type are required for Instagram')
      }

      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${userId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            creation_id: mediaId,
            access_token: accessToken
          })
        }
      )

      const publishData = await publishResponse.json()
      if (!publishResponse.ok) {
        throw new Error(publishData.error?.message || 'Publish failed')
      }

      return {
        platform: 'instagram',
        success: true,
        postId: publishData.id,
        url: `https://www.instagram.com/p/${publishData.id}/`
      }
    } catch (error) {
      return {
        platform: 'instagram',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async postToTikTok(content: PostContent): Promise<PostResult> {
    if (!this.tokens.tiktok) {
      return {
        platform: 'tiktok',
        success: false,
        error: 'TikTok not connected'
      }
    }

    try {
      const { accessToken, openId } = this.tokens.tiktok

      if (!content.mediaFile || content.mediaType !== 'video') {
        throw new Error('Video file is required for TikTok')
      }

      const initResponse = await fetch(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post_info: {
              title: content.caption.substring(0, 150),
              privacy_level: 'SELF_ONLY',
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
              video_cover_timestamp_ms: 1000
            },
            source_info: {
              source: 'FILE_UPLOAD',
              video_size: content.mediaFile.size,
              chunk_size: content.mediaFile.size,
              total_chunk_count: 1
            }
          })
        }
      )

      const initData = await initResponse.json()
      if (!initResponse.ok || initData.error) {
        throw new Error(initData.error?.message || 'TikTok init failed')
      }

      const { publish_id, upload_url } = initData.data

      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': content.mediaFile.size.toString()
        },
        body: content.mediaFile
      })

      if (!uploadResponse.ok) {
        throw new Error('Video upload to TikTok failed')
      }

      const statusResponse = await fetch(
        `https://open.tiktokapis.com/v2/post/publish/status/${publish_id}/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      const statusData = await statusResponse.json()

      return {
        platform: 'tiktok',
        success: true,
        postId: publish_id,
        url: statusData.data?.share_url
      }
    } catch (error) {
      return {
        platform: 'tiktok',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async postToYouTube(content: PostContent): Promise<PostResult> {
    if (!this.tokens.youtube) {
      return {
        platform: 'youtube',
        success: false,
        error: 'YouTube not connected'
      }
    }

    try {
      const { accessToken } = this.tokens.youtube

      if (!content.mediaFile || content.mediaType !== 'video') {
        throw new Error('Video file is required for YouTube')
      }

      const metadata = {
        snippet: {
          title: content.caption.substring(0, 100) || 'New Short',
          description: content.caption,
          categoryId: '10',
          tags: ['shorts', 'music']
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      }

      const initResponse = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Length': content.mediaFile.size.toString(),
            'X-Upload-Content-Type': content.mediaFile.type
          },
          body: JSON.stringify(metadata)
        }
      )

      const uploadUrl = initResponse.headers.get('Location')
      if (!uploadUrl) {
        throw new Error('Failed to get YouTube upload URL')
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': content.mediaFile.type
        },
        body: content.mediaFile
      })

      const uploadData = await uploadResponse.json()
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || 'YouTube upload failed')
      }

      if (content.coverImageUrl) {
        try {
          const thumbnailBlob = await fetch(content.coverImageUrl).then(r => r.blob())
          await fetch(
            `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${uploadData.id}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': thumbnailBlob.type
              },
              body: thumbnailBlob
            }
          )
        } catch (thumbnailError) {
          console.warn('Failed to set thumbnail:', thumbnailError)
        }
      }

      return {
        platform: 'youtube',
        success: true,
        postId: uploadData.id,
        url: `https://www.youtube.com/shorts/${uploadData.id}`
      }
    } catch (error) {
      return {
        platform: 'youtube',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async postToTwitter(content: PostContent): Promise<PostResult> {
    if (!this.tokens.twitter) {
      return {
        platform: 'twitter',
        success: false,
        error: 'Twitter/X not connected'
      }
    }

    try {
      const { accessToken, accessTokenSecret } = this.tokens.twitter

      let mediaId: string | undefined

      if (content.mediaFile) {
        const formData = new FormData()
        formData.append('media', content.mediaFile)

        const uploadResponse = await fetch(
          'https://upload.twitter.com/1.1/media/upload.json',
          {
            method: 'POST',
            headers: {
              'Authorization': `OAuth oauth_token="${accessToken}"`
            },
            body: formData
          }
        )

        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) {
          throw new Error(uploadData.errors?.[0]?.message || 'Media upload failed')
        }
        mediaId = uploadData.media_id_string
      }

      const tweetData: any = {
        text: content.caption
      }

      if (mediaId) {
        tweetData.media = {
          media_ids: [mediaId]
        }
      }

      const tweetResponse = await fetch(
        'https://api.twitter.com/2/tweets',
        {
          method: 'POST',
          headers: {
            'Authorization': `OAuth oauth_token="${accessToken}"`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tweetData)
        }
      )

      const tweetResponseData = await tweetResponse.json()
      if (!tweetResponse.ok) {
        throw new Error(tweetResponseData.errors?.[0]?.message || 'Tweet failed')
      }

      return {
        platform: 'twitter',
        success: true,
        postId: tweetResponseData.data.id,
        url: `https://twitter.com/i/web/status/${tweetResponseData.data.id}`
      }
    } catch (error) {
      return {
        platform: 'twitter',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async refreshYouTubeToken(): Promise<boolean> {
    if (!this.tokens.youtube?.refreshToken) {
      return false
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: 'YOUR_CLIENT_ID',
          client_secret: 'YOUR_CLIENT_SECRET',
          refresh_token: this.tokens.youtube.refreshToken,
          grant_type: 'refresh_token'
        })
      })

      const data = await response.json()
      if (!response.ok) {
        return false
      }

      this.tokens.youtube.accessToken = data.access_token
      this.tokens.youtube.expiresAt = Date.now() + (data.expires_in * 1000)

      return true
    } catch (error) {
      return false
    }
  }

  async refreshTikTokToken(): Promise<boolean> {
    if (!this.tokens.tiktok?.refreshToken) {
      return false
    }

    try {
      const response = await fetch('https://open-api.tiktok.com/oauth/refresh_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_key: 'YOUR_CLIENT_KEY',
          client_secret: 'YOUR_CLIENT_SECRET',
          refresh_token: this.tokens.tiktok.refreshToken,
          grant_type: 'refresh_token'
        })
      })

      const data = await response.json()
      if (!response.ok || !data.data) {
        return false
      }

      this.tokens.tiktok.accessToken = data.data.access_token
      this.tokens.tiktok.refreshToken = data.data.refresh_token
      this.tokens.tiktok.expiresAt = Date.now() + (data.data.expires_in * 1000)

      return true
    } catch (error) {
      return false
    }
  }
}

export async function postToMultiplePlatforms(
  platforms: string[],
  content: PostContent,
  tokens: SocialMediaTokens
): Promise<PostResult[]> {
  const api = new SocialMediaAPI(tokens)
  const results: PostResult[] = []

  for (const platform of platforms) {
    let result: PostResult

    switch (platform) {
      case 'instagram':
        result = await api.postToInstagram(content)
        break
      case 'tiktok':
        result = await api.postToTikTok(content)
        break
      case 'youtube':
        result = await api.postToYouTube(content)
        break
      case 'twitter':
        result = await api.postToTwitter(content)
        break
      default:
        result = {
          platform,
          success: false,
          error: 'Unknown platform'
        }
    }

    results.push(result)
  }

  return results
}
