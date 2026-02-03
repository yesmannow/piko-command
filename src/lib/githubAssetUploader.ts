import { Octokit } from 'octokit'

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

const REPO_OWNER = 'yesmannow'
const REPO_NAME = 'piko-artist-website-v3'
const TRACKS_JSON_PATH = 'src/data/piko-tracks.json'

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(new Error('File reading failed'))
    reader.readAsDataURL(file)
  })
}

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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

    const trackSlug = sanitizeFilename(metadata.title)
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
      owner: REPO_OWNER,
      repo: REPO_NAME,
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
        owner: REPO_OWNER,
        repo: REPO_NAME,
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
    console.error('GitHub asset upload error:', error)
    if (error instanceof Error) {
      throw new Error(`GitHub upload failed: ${error.message}`)
    }
    throw new Error('GitHub upload failed with unknown error')
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

    let existingTracks: any[] = []
    let fileSha: string | undefined

    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: TRACKS_JSON_PATH,
      })

      if ('content' in fileData) {
        const content = atob(fileData.content.replace(/\s/g, ''))
        existingTracks = JSON.parse(content)
        fileSha = fileData.sha
      }
    } catch (error: any) {
      if (error.status === 404) {
        existingTracks = []
      } else {
        throw new Error(`Failed to fetch existing tracks: ${error.message}`)
      }
    }

    const newTrack = {
      id: `track-${Date.now()}`,
      title: metadata.title,
      artist: metadata.artist,
      vibe: metadata.vibe || 'Hip-Hop',
      audioUrl: audioUrl,
      coverImage: coverImageUrl || '/images/default-cover.jpg',
      releaseDate: metadata.releaseDate || new Date().toISOString().split('T')[0],
      status: 'live',
    }

    existingTracks.unshift(newTrack)

    const updatedContent = JSON.stringify(existingTracks, null, 2)
    const encodedContent = btoa(updatedContent)

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: TRACKS_JSON_PATH,
      message: `Add track metadata: ${metadata.title}`,
      content: encodedContent,
      sha: fileSha,
    })
  } catch (error) {
    console.error('GitHub metadata sync error:', error)
    if (error instanceof Error) {
      throw new Error(`Metadata sync failed: ${error.message}`)
    }
    throw new Error('Metadata sync failed with unknown error')
  }
}

export async function checkGitHubConnection(credentials: GitHubCredentials): Promise<boolean> {
  try {
    const octokit = new Octokit({
      auth: credentials.githubToken,
    })

    await octokit.rest.repos.get({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    })

    return true
  } catch (error) {
    console.error('GitHub connection check failed:', error)
    return false
  }
}
