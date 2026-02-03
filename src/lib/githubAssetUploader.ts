import { Octokit } from 'octokit'

interface GitHubCredentials {
  githubToken: string
}
interface UploadResul
 

  title: string
  vibe?: string
}
c

async function fileToBase
    const reade
      if (typeof
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
}
export 
  cov
  credentials: GitHubCredentials,
  coverProgressCallback?: (pro
  tr
 

    const audioExtension = audioFile.name.split('.').
    const audioPa
    if (audioProgr
    }
    const audioBase64 = 
    if (audioProgressCallb
 

      repo: REPO_NAME,
      message: `Up
    })
    if (audioProgressCallb
    }
    const audioUrl = `/audio/tracks/${audioFilename}`
    let coverImageUrl: string | undefined
    if (coverImageFile) {
       

      const coverFilename = `${track


        coverProgressCallback(50)

        owner: REPO_OWNER,
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
      audioUrl: audioUrl,
      releaseDate: metadata.releaseDate || new Date().toISOStri
    }
    existingTracks.unshift(newTrack)
   


      path: TRACKS_JSON_PATH,
      content: encodedCont
    })
    console.error('GitHub metadata s
      throw new Error(`Metadata 
    throw new Erro
}
export async function checkGitHub
    const octokit = new Octokit({
    })

      repo: REPO_NAME,


    retur
}




































































