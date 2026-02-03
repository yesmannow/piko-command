interface GitHubCredentials {
  githubToken: string
  githubRepo: string
  githubOwner: string
}

export interface TrackData {
  id: string
  title: string
  artist: string
  releaseDate: string
  status: 'live' | 'draft' | 'scheduled'
  r2: {
    audioUrl: string
    coverImageUrl?: string
  }
  social?: {
    youTubePostId?: string
    facebookPostId?: string
    twitterPostUrl?: string
  }
  stats?: {
    shares: number
    fireEmojis: number
    comments: number
    engagementRate: string
  }
}

export async function updateTracksJSON(
  trackData: TrackData,
  credentials: GitHubCredentials
): Promise<boolean> {
  const filePath = 'tracks.json'
  const repoUrl = `https://api.github.com/repos/${credentials.githubOwner}/${credentials.githubRepo}/contents/${filePath}`

  let currentSHA = ''
  let currentTracks: TrackData[] = []

  try {
    const getResponse = await fetch(repoUrl, {
      headers: {
        'Authorization': `Bearer ${credentials.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (getResponse.ok) {
      const data = await getResponse.json()
      currentSHA = data.sha
      const content = atob(data.content)
      currentTracks = JSON.parse(content)
    }
  } catch (error) {
    currentTracks = []
  }

  currentTracks.unshift(trackData)

  const newContent = btoa(JSON.stringify(currentTracks, null, 2))

  const updateResponse = await fetch(repoUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${credentials.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `CI(app): Add new track ${trackData.title}`,
      content: newContent,
      sha: currentSHA || undefined
    })
  })

  if (!updateResponse.ok) {
    throw new Error(`GitHub update failed: ${updateResponse.statusText}`)
  }

  return true
}

export async function fetchTracksJSON(
  credentials: GitHubCredentials
): Promise<TrackData[]> {
  const filePath = 'tracks.json'
  const repoUrl = `https://api.github.com/repos/${credentials.githubOwner}/${credentials.githubRepo}/contents/${filePath}`

  const response = await fetch(repoUrl, {
    headers: {
      'Authorization': `Bearer ${credentials.githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = atob(data.content)
  return JSON.parse(content) as TrackData[]
}
