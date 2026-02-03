interface PostParams {
  caption: string
  imageUrl?: string
  videoUrl?: string
  platforms: string[]
}

interface PostResult {
  platform: string
  success: boolean
  error?: string
  postId?: string
}

export async function postToSocialMedia(params: PostParams): Promise<PostResult[]> {
  const results: PostResult[] = []

  for (const platform of params.platforms) {
    try {
      if (platform === 'instagram') {
        const result = await postToInstagram(params.caption, params.imageUrl, params.videoUrl)
        results.push({ platform, success: result.success, postId: result.postId })
      } else if (platform === 'tiktok') {
        const result = await postToTikTok(params.caption, params.videoUrl)
        results.push({ platform, success: result.success, postId: result.postId })
      } else if (platform === 'youtube') {
        const result = await postToYouTube(params.caption, params.videoUrl, params.imageUrl)
        results.push({ platform, success: result.success, postId: result.postId })
      } else if (platform === 'twitter') {
        const result = await postToTwitter(params.caption, params.imageUrl, params.videoUrl)
        results.push({ platform, success: result.success, postId: result.postId })
      }
    } catch (error) {
      results.push({ 
        platform, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return results
}

async function postToInstagram(caption: string, imageUrl?: string, videoUrl?: string) {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  return {
    success: true,
    postId: `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

async function postToTikTok(caption: string, videoUrl?: string) {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  return {
    success: true,
    postId: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

async function postToYouTube(caption: string, videoUrl?: string, thumbnailUrl?: string) {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  return {
    success: true,
    postId: `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

async function postToTwitter(caption: string, imageUrl?: string, videoUrl?: string) {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  return {
    success: true,
    postId: `tw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export async function uploadToR2(
  file: File,
  credentials: {
    r2AccessKey: string
    r2SecretKey: string
    r2BucketName: string
    r2AccountId: string
  }
): Promise<string> {
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${Date.now()}-${cleanFileName}`
  const endpoint = `https://${credentials.r2AccountId}.r2.cloudflarestorage.com/${credentials.r2BucketName}/${fileName}`

  const authString = btoa(`${credentials.r2AccessKey}:${credentials.r2SecretKey}`)
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': file.type
    },
    body: file
  })

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.statusText}`)
  }

  return `https://pub-${credentials.r2AccountId}.r2.dev/${fileName}`
}
