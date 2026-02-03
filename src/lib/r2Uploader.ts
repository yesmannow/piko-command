import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface R2Credentials {
  r2AccessKey: string
  r2SecretKey: string
  r2BucketName: string
  r2AccountId: string
}

interface UploadResult {
  audioUrl: string
  coverImageUrl?: string
}

export async function uploadConcurrent(
  audioFile: File,
  coverImageFile: File | null,
  credentials: R2Credentials,
  audioProgressCallback?: (progress: number) => void,
  coverProgressCallback?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${credentials.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: credentials.r2AccessKey,
        secretAccessKey: credentials.r2SecretKey,
      },
    })

    const timestamp = Date.now()
    const sanitizeFilename = (filename: string) => {
      return filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    }

    const audioFilename = `${timestamp}_${sanitizeFilename(audioFile.name)}`
    const audioKey = `tracks/${audioFilename}`

    const uploadPromises: Promise<any>[] = []

    const audioUploadPromise = (async () => {
      try {
        if (audioProgressCallback) {
          audioProgressCallback(10)
        }

        const audioBuffer = await audioFile.arrayBuffer()
        
        if (audioProgressCallback) {
          audioProgressCallback(30)
        }

        const audioCommand = new PutObjectCommand({
          Bucket: credentials.r2BucketName,
          Key: audioKey,
          Body: new Uint8Array(audioBuffer),
          ContentType: audioFile.type || 'audio/mpeg',
        })

        if (audioProgressCallback) {
          audioProgressCallback(60)
        }

        await s3Client.send(audioCommand)

        if (audioProgressCallback) {
          audioProgressCallback(100)
        }

        return `https://${credentials.r2BucketName}.${credentials.r2AccountId}.r2.cloudflarestorage.com/${audioKey}`
      } catch (error) {
        console.error('Audio upload error:', error)
        throw new Error(`Audio upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })()

    uploadPromises.push(audioUploadPromise)

    let coverUploadPromise: Promise<string | undefined> = Promise.resolve(undefined)

    if (coverImageFile) {
      coverUploadPromise = (async () => {
        try {
          const coverFilename = `${timestamp}_${sanitizeFilename(coverImageFile.name)}`
          const coverKey = `covers/${coverFilename}`

          if (coverProgressCallback) {
            coverProgressCallback(10)
          }

          const coverBuffer = await coverImageFile.arrayBuffer()

          if (coverProgressCallback) {
            coverProgressCallback(30)
          }

          const coverCommand = new PutObjectCommand({
            Bucket: credentials.r2BucketName,
            Key: coverKey,
            Body: new Uint8Array(coverBuffer),
            ContentType: coverImageFile.type || 'image/png',
          })

          if (coverProgressCallback) {
            coverProgressCallback(60)
          }

          await s3Client.send(coverCommand)

          if (coverProgressCallback) {
            coverProgressCallback(100)
          }

          return `https://${credentials.r2BucketName}.${credentials.r2AccountId}.r2.cloudflarestorage.com/${coverKey}`
        } catch (error) {
          console.error('Cover upload error:', error)
          throw new Error(`Cover upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })()

      uploadPromises.push(coverUploadPromise)
    }

    const [audioUrl, coverImageUrl] = await Promise.all([audioUploadPromise, coverUploadPromise])

    return {
      audioUrl,
      coverImageUrl,
    }
  } catch (error) {
    console.error('Upload function error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Upload failed with unknown error')
  }
}
