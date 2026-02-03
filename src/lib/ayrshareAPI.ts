export interface AyrsharePostContent {
  platforms: (
  platforms: ('instagram' | 'twitter' | 'tiktok' | 'youtube' | 'facebook')[]
  mediaUrls?: string[]
}
export interface A
  id: string
   
}

}
export class Ayr
  id: string
  constructor
  }
  async create
    status: string
    url?: string
  }[]
  errors?: any[]
}

export class AyrshareAPI {
  private apiKey: string
  private baseUrl = 'https://api.ayrshare.com/api'

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
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Ayrshare API error: ${response.status}`)
    }

    return await response.json()


    }
    const response = await fetch(`${this.baseUrl}/history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`

    })

    if (!response.ok) {
      throw new Error(`Failed to fetch post history: ${response.status}`)
    }

    return await response.json()



    const response = await fetch(`${this.baseUrl}/post/${id}`, {













