import { Octokit } from 'octokit'
import { logger } from './logger'

interface GitHubCredentials {
  githubToken: string
  githubRepo: string
  githubOwner: string
}

interface UploadResult {
  audioUrl: string
  coverImageUrl?: string
}

interface TrackMetadata {
  title: string
  artist: string
  vibe?: string
  releaseDate?: string
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to read file as base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function uploadAssetsToGitHub(
  audioFile: File,
  coverImageFile: File | null,
  metadata: TrackMetadata,
  credentials: GitHubCredentials,
  audioProgressCallback?: (progress: number) => void,
  coverProgressCallback?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const octokit = new Octokit({
      auth: credentials.githubToken,
    })

    const trackSlug = metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const audioExtension = audioFile.name.split('.').pop() || 'mp3'
    const audioFilename = `${trackSlug}.${audioExtension}`
    const audioPath = `public/audio/tracks/${audioFilename}`

    if (audioProgressCallback) {
      audioProgressCallback(10)
    }

    const audioBase64 = await fileToBase64(audioFile)

    if (audioProgressCallback) {
      audioProgressCallback(40)
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: credentials.githubOwner,
      repo: credentials.githubRepo,
      path: audioPath,
      message: `Upload audio track: ${metadata.title}`,
      content: audioBase64,
    })

    if (audioProgressCallback) {
      audioProgressCallback(100)
    }

    const audioUrl = `/audio/tracks/${audioFilename}`

    let coverImageUrl: string | undefined

    if (coverImageFile) {
      if (coverProgressCallback) {
        coverProgressCallback(10)
      }

      const coverExtension = coverImageFile.name.split('.').pop() || 'jpg'
      const coverFilename = `${trackSlug}.${coverExtension}`
      const coverPath = `public/images/covers/${coverFilename}`

      const coverBase64 = await fileToBase64(coverImageFile)

      if (coverProgressCallback) {
        coverProgressCallback(50)
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: credentials.githubOwner,
        repo: credentials.githubRepo,
        path: coverPath,
        message: `Upload cover art: ${metadata.title}`,
        content: coverBase64,
      })

      if (coverProgressCallback) {
        coverProgressCallback(100)
      }

      coverImageUrl = `/images/covers/${coverFilename}`
    }

    return {
      audioUrl,
      coverImageUrl,
    }
  } catch (error) {
    logger.github('asset_upload', false, error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
    throw new Error('Upload failed: Unknown error')
  }
}

export async function syncTrackMetadata(
  metadata: TrackMetadata,
  audioUrl: string,
  coverImageUrl: string | undefined,
  credentials: GitHubCredentials
): Promise<void> {
  try {
    const octokit = new Octokit({
      auth: credentials.githubToken,
    })

    const TRACKS_JSON_PATH = 'src/data/piko-tracks.json'

    interface Track {
      id: string;
      title: string;
      artist: string;
      vibe: string;
      audioUrl: string;
      coverImageUrl?: string;
      releaseDate: string;
    }

    let existingTracks: Track[] = []
    let sha: string | undefined

    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: credentials.githubOwner,
        repo: credentials.githubRepo,
        path: TRACKS_JSON_PATH,
      })

      if ('content' in fileData && fileData.content) {
        sha = fileData.sha
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
        existingTracks = JSON.parse(content) as Track[]
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status !== 404) {
        throw error
      }
      // File doesn't exist yet, that's ok
      logger.info('piko-tracks.json not found, will create new file')
    }

    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: metadata.title,
      artist: metadata.artist,
      vibe: metadata.vibe || 'Hip-Hop',
      audioUrl: audioUrl,
      coverImageUrl: coverImageUrl,
      releaseDate: metadata.releaseDate || new Date().toISOString().split('T')[0],
    }

    existingTracks.unshift(newTrack)

    const encodedContent = Buffer.from(JSON.stringify(existingTracks, null, 2)).toString('base64')

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: credentials.githubOwner,
      repo: credentials.githubRepo,
      path: TRACKS_JSON_PATH,
      message: `Add track metadata: ${metadata.title}`,
      content: encodedContent,
      sha: sha,
    })
    
    logger.github('metadata_sync', true, `Synced ${metadata.title}`)
  } catch (error) {
    logger.github('metadata_sync', false, error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Metadata sync failed: ${error.message}`)
    }
    throw new Error('Metadata sync failed: Unknown error')
  }
}

export async function checkGitHubConnection(credentials: GitHubCredentials): Promise<boolean> {
  try {
    const octokit = new Octokit({
      auth: credentials.githubToken,
    })

    await octokit.rest.repos.get({
      owner: credentials.githubOwner,
      repo: credentials.githubRepo,
    })

    logger.github('connection_check', true, 'Repository accessible')
    return true
  } catch (error) {
    logger.github('connection_check', false, error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}
