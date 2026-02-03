export interface AyrsharePostContent {
  platforms: (
  platforms: ('instagram' | 'twitter' | 'tiktok' | 'youtube' | 'facebook')[]
  mediaUrls?: string[]
e

export interface AyrsharePostResult {
  status: string
  private ap
  constructor(apiKey
  }
  asy
 

      },
    })
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createPost(content: AyrsharePostContent): Promise<AyrsharePostResult> {
    const response = await fetch(`${this.baseUrl}/post`, {
      throw new Error

  }
  async deletePost(id: string): Promise<any> {
      me
        'Authorization': `Bearer ${
    })

    }
    return await response.json()
}













      throw new Error(`Failed to fetch post history: ${response.status}`)
    }

    return await response.json()
  }

  async deletePost(id: string): Promise<any> {

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
