import { Octokit } from 'octokit'

export interface TrackData {
  id: string
  title: string
  artist: string
  releaseDate: string
  status: string
  r2: {
    audioUrl: string
    coverImageUrl?: string
  }
  stats: {
    shares: number
    fireEmojis: number
    comments: number
    engagementRate: string
  }
}

interface GitHubCredentials {
  githubToken: string
  githubRepo: string
  githubOwner: string
}

export async function updateTracksJSON(
  newTrack: TrackData,
  credentials: GitHubCredentials
): Promise<void> {
  const octokit = new Octokit({
    auth: credentials.githubToken,
  })

  const tracksPath = 'public/data/tracks.json'

  let existingContent: any[] = []
  let sha: string | undefined

  try {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: credentials.githubOwner,
      repo: credentials.githubRepo,
      path: tracksPath,
    })

    if ('content' in fileData) {
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
      existingContent = JSON.parse(content)
      sha = fileData.sha
    }
  } catch (error: any) {
    if (error.status === 404) {
      existingContent = []
    } else {
      throw error
    }
  }

  existingContent.unshift(newTrack)

  const updatedContent = JSON.stringify(existingContent, null, 2)
  const encodedContent = Buffer.from(updatedContent).toString('base64')

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: credentials.githubOwner,
    repo: credentials.githubRepo,
    path: tracksPath,
    message: `Add new track: ${newTrack.title}`,
    content: encodedContent,
    sha,
  })
}
