export interface PostHistory {
  id: string
  platforms: stri
  linkInBio: boolean
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
