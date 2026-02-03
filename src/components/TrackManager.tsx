import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, Music, CheckCircle, ExternalLink, Loader2, Globe, AlertCircle } from 'lucide-react'

interface VaultCredentials {
  r2AccessKey: string
  r2SecretKey: string
  r2BucketName: string
  r2AccountId: string
  githubToken: string
  githubRepo: string
  githubOwner: string
}

interface TrackMetadata {
  title: string
  artist: string
  releaseDate: string
}

interface UploadedTrack {
  id: string
  title: string
  artist: string
  r2Url: string
  uploadedAt: number
}

export function TrackManager() {
  const [credentials] = useKV<VaultCredentials>('vault-credentials', {
    r2AccessKey: '',
    r2SecretKey: '',
    r2BucketName: '',
    r2AccountId: '',
    githubToken: '',
    githubRepo: '',
    githubOwner: ''
  })
  const [uploadedTracks, setUploadedTracks] = useKV<UploadedTrack[]>('uploaded-tracks', [])
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<TrackMetadata>({
    title: '',
    artist: 'PIKO',
    releaseDate: new Date().toISOString().split('T')[0]
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'syncing' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateCredentials = () => {
    if (!credentials) return false
    return !!(
      credentials.r2AccessKey &&
      credentials.r2SecretKey &&
      credentials.r2BucketName &&
      credentials.r2AccountId &&
      credentials.githubToken &&
      credentials.githubRepo &&
      credentials.githubOwner
    )
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file')
      return
    }

    setSelectedFile(file)
    if (!metadata.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      setMetadata(prev => ({ ...prev, title: fileName }))
    }
  }

  const uploadToR2 = async (file: File): Promise<string> => {
    if (!credentials) throw new Error('Missing credentials')

    const fileName = `tracks/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const endpoint = `https://${credentials.r2AccountId}.r2.cloudflarestorage.com/${credentials.r2BucketName}/${fileName}`

    const authString = btoa(`${credentials.r2AccessKey}:${credentials.r2SecretKey}`)
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': file.type
      },
      body: file
    })

    if (!response.ok) {
      throw new Error(`R2 upload failed: ${response.statusText}`)
    }

    return `https://pub-${credentials.r2AccountId}.r2.dev/${fileName}`
  }

  const updateGitHubRepo = async (trackData: UploadedTrack) => {
    if (!credentials) throw new Error('Missing credentials')

    const filePath = 'tracks.json'
    const repoUrl = `https://api.github.com/repos/${credentials.githubOwner}/${credentials.githubRepo}/contents/${filePath}`

    let currentSHA = ''
    let currentTracks: UploadedTrack[] = []

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
        message: `Add track: ${trackData.title}`,
        content: newContent,
        sha: currentSHA || undefined
      })
    })

    if (!updateResponse.ok) {
      throw new Error(`GitHub update failed: ${updateResponse.statusText}`)
    }

    return true
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Select an audio file first')
      return
    }

    if (!metadata.title.trim()) {
      toast.error('Enter a track title')
      return
    }

    if (!validateCredentials()) {
      toast.error('Configure vault credentials first!')
      return
    }

    setIsUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      setUploadProgress(30)
      const r2Url = await uploadToR2(selectedFile)
      
      setUploadProgress(60)
      setUploadStatus('syncing')

      const trackData: UploadedTrack = {
        id: Date.now().toString(),
        title: metadata.title,
        artist: metadata.artist,
        r2Url,
        uploadedAt: Date.now()
      }

      await updateGitHubRepo(trackData)
      
      setUploadProgress(100)
      setUploadStatus('success')

      setUploadedTracks(prev => [trackData, ...(prev || [])])

      toast.success(`${metadata.title} uploaded and synced!`)
      
      setSelectedFile(null)
      setMetadata({ title: '', artist: 'PIKO', releaseDate: new Date().toISOString().split('T')[0] })
      setUploadProgress(0)

      setTimeout(() => {
        setUploadStatus('idle')
      }, 3000)
    } catch (error) {
      setUploadStatus('error')
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Upload className="w-6 h-6 text-accent" />
            STUDIO-TO-WEB UPLOAD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded transition-all p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="track-upload"
            />

            {!selectedFile ? (
              <label
                htmlFor="track-upload"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                  <Music className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <p className="text-base font-black text-foreground mb-2 uppercase tracking-wide">
                  Select Track File
                </p>
                <p className="text-sm text-muted-foreground">
                  MP3, WAV, FLAC, or any audio format
                </p>
              </label>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Track Title</Label>
            <Input
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter track name..."
              className="bg-muted/50"
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Artist</Label>
              <Input
                value={metadata.artist}
                onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Artist name"
                className="bg-muted/50"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Release Date</Label>
              <Input
                type="date"
                value={metadata.releaseDate}
                onChange={(e) => setMetadata(prev => ({ ...prev, releaseDate: e.target.value }))}
                className="bg-muted/50"
                disabled={isUploading}
              />
            </div>
          </div>

          {uploadStatus !== 'idle' && (
            <div className="space-y-2 p-4 rounded border border-border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {uploadStatus === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {uploadStatus === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                  {uploadStatus === 'success' && <CheckCircle className="w-4 h-4 text-secondary" />}
                  {uploadStatus === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                  <span className="text-sm font-black uppercase">
                    {uploadStatus === 'uploading' && 'Uploading to R2...'}
                    {uploadStatus === 'syncing' && 'Syncing to GitHub...'}
                    {uploadStatus === 'success' && 'Complete!'}
                    {uploadStatus === 'error' && 'Upload Failed'}
                  </span>
                </div>
                <span className="text-sm font-bold">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button
            onClick={handleUpload}
            className="w-full bg-accent hover:bg-accent/90 text-lg font-black uppercase neon-glow-orange"
            size="lg"
            disabled={!selectedFile || !metadata.title.trim() || isUploading}
          >
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? 'UPLOADING...' : 'UPLOAD & SYNC'}
          </Button>
        </CardContent>
      </Card>

      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Music className="w-6 h-6 text-secondary" />
            UPLOADED TRACKS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!uploadedTracks || uploadedTracks.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tracks uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedTracks.map(track => (
                <div
                  key={track.id}
                  className="p-4 rounded border border-border hover:border-secondary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-black text-lg mb-1">{track.title}</h3>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                    <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Synced
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(track.uploadedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <a
                      href={track.r2Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-secondary transition-colors"
                    >
                      R2 URL <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            LIVE WEBSITE PREVIEW
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-video rounded border border-border overflow-hidden bg-muted">
              <iframe
                src="https://piko-artist-website.vercel.app/"
                className="w-full h-full"
                title="Live Website Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://piko-artist-website.vercel.app/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
