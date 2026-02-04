import { Octokit } from 'octokit'
import { logger } from './logger'

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
  try {
    const octokit = new Octokit({
      auth: credentials.githubToken,
    })

    const tracksPath = 'public/data/tracks.json'

    let existingContent: TrackData[] = []
    let sha: string | undefined

    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: credentials.githubOwner,
        repo: credentials.githubRepo,
        path: tracksPath,
      })

      if ('content' in fileData && fileData.content) {
        const content = atob(fileData.content.replace(/\s/g, ''))
        existingContent = JSON.parse(content) as TrackData[]
        sha = fileData.sha
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        existingContent = []
        logger.info('tracks.json not found, will create new file')
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.github('fetch_tracks', false, errorMessage)
        throw new Error(`Failed to fetch existing tracks: ${errorMessage}`)
      }
    }

    existingContent.unshift(newTrack)

    const updatedContent = JSON.stringify(existingContent, null, 2)
    const encodedContent = btoa(updatedContent)

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: credentials.githubOwner,
      repo: credentials.githubRepo,
      path: tracksPath,
      message: `Add new track: ${newTrack.title}`,
      content: encodedContent,
      sha,
    })
    
    logger.github('update_tracks_json', true, `Added ${newTrack.title}`)
  } catch (error) {
    logger.github('update_tracks_json', false, error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to sync to GitHub')
  }
}
