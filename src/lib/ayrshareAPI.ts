export interface AyrsharePostContent {
  post: string
  platforms: ('instagram' | 'twitter' | 'tiktok' | 'youtube' | 'facebook')[]
  mediaUrls?: string[]
}

export interface AyrsharePostResult {
  status: string
  errors?: {
    platform: string
    status: string
  }[]
}

export class AyrshareAPI {
  private baseUrl = 'https://app.ayrshare.com/api'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createPost(content: AyrsharePostContent): Promise<AyrsharePostResult> {
    const response = await fetch(`${this.baseUrl}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(content)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Ayrshare API error: ${response.status}`)
    }

    return await response.json()
  }

  async getPostHistory(limit: number = 10): Promise<any> {
    const response = await fetch(`${this.baseUrl}/history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch post history: ${response.status}`)
    }

    return await response.json()
  }

  async deletePost(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.status}`)
    }

    return await response.json()
  }
}
