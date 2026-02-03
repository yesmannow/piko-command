export interface PostHistory {
  id: string
  caption: string
  platforms: string[]
  timestamp: number
  linkInBio: boolean
}

export interface HypeEvent {
  id: string
  timestamp: string
  payload: {
    caption: string
    mediaUrl?: string
    link?: string
    mediaType: 'video' | 'image' | 'audio'
  }
  platforms: ('instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin')[]
  metrics: {
    shares: number
    fireEmojis: number
    comments: number
  }
  previewData?: {
    thumbnailUrl?: string
    trackTitle?: string
  }
}
