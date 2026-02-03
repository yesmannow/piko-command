import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

interface VaultCredentials {
  r2AccessKey: string
  r2SecretKey: string
  r2BucketName: string
  r2AccountId: string
}

export async function uploadToR2(
  file: File,
  credentials: VaultCredentials,
  prefix: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${credentials.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: credentials.r2AccessKey,
      secretAccessKey: credentials.r2SecretKey,
    },
  })

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${prefix}/${Date.now()}-${cleanFileName}`

  const fileBuffer = await file.arrayBuffer()

  const command = new PutObjectCommand({
    Bucket: credentials.r2BucketName,
    Key: fileName,
    Body: new Uint8Array(fileBuffer),
    ContentType: file.type,
  })

  await r2Client.send(command)

  if (onProgress) {
    onProgress(100)
  }

  return `https://pub-${credentials.r2AccountId}.r2.dev/${fileName}`
}

export async function uploadConcurrent(
  audioFile: File | null,
  coverImage: File | null,
  credentials: VaultCredentials,
  onAudioProgress?: (progress: number) => void,
  onCoverProgress?: (progress: number) => void
): Promise<{ audioUrl: string; coverImageUrl?: string }> {
  const uploadPromises: Promise<string>[] = []

  if (audioFile) {
    uploadPromises.push(uploadToR2(audioFile, credentials, 'tracks', onAudioProgress))
  } else {
    throw new Error('Audio file is required')
  }

  if (coverImage) {
    uploadPromises.push(uploadToR2(coverImage, credentials, 'covers', onCoverProgress))
  }

  const results = await Promise.all(uploadPromises)

  return {
    audioUrl: results[0],
    coverImageUrl: results.length > 1 ? results[1] : undefined,
  }
}
