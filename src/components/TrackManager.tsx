import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Upload, Music, CheckCircle, ExternalLink, Loader2, Globe, AlertCircle, Settings, Sparkles, Image as ImageIcon, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { uploadConcurrent } from '@/lib/r2Uploader'
import { updateTracksJSON, type TrackData } from '@/lib/githubAPI'

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
  audioUrl: string
  coverImageUrl?: string
  releaseDate?: string
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
  
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<TrackMetadata>({
    title: '',
    artist: 'PIKO',
    releaseDate: new Date().toISOString().split('T')[0]
  })
  const [audioUploadProgress, setAudioUploadProgress] = useState(0)
  const [coverUploadProgress, setCoverUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading-audio' | 'uploading-cover' | 'syncing' | 'success' | 'error'>('idle')
  const [uploadStage, setUploadStage] = useState<string>('')
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

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

  const handleAudioFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file')
      return
    }

    setSelectedAudioFile(file)
    if (!metadata.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      setMetadata(prev => ({ ...prev, title: fileName }))
    }
  }

  const handleCoverImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
    }

    const preview = URL.createObjectURL(file)
    setSelectedCoverImage(file)
    setCoverPreview(preview)
  }

  const removeCoverImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
    }
    setSelectedCoverImage(null)
    setCoverPreview(null)
  }

  const handleUpload = async () => {
    if (!selectedAudioFile) {
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
    setUploadStatus('uploading-audio')
    setAudioUploadProgress(0)
    setCoverUploadProgress(0)

    try {
      setUploadStage('Uploading files to R2...')
      
      const { audioUrl, coverImageUrl } = await uploadConcurrent(
        selectedAudioFile,
        selectedCoverImage,
        {
          r2AccessKey: credentials!.r2AccessKey,
          r2SecretKey: credentials!.r2SecretKey,
          r2BucketName: credentials!.r2BucketName,
          r2AccountId: credentials!.r2AccountId,
        },
        (progress) => setAudioUploadProgress(progress),
        (progress) => setCoverUploadProgress(progress)
      )
      
      setUploadStatus('syncing')
      setUploadStage('Syncing to GitHub...')

      const trackData: TrackData = {
        id: `track-${Date.now()}`,
        title: metadata.title,
        artist: metadata.artist,
        releaseDate: metadata.releaseDate,
        status: 'live',
        r2: {
          audioUrl,
          coverImageUrl,
        },
        stats: {
          shares: 0,
          fireEmojis: 0,
          comments: 0,
          engagementRate: '0%'
        }
      }

      await updateTracksJSON(trackData, {
        githubToken: credentials!.githubToken,
        githubRepo: credentials!.githubRepo,
        githubOwner: credentials!.githubOwner,
      })
      
      setUploadStatus('success')
      setUploadStage('Complete!')

      const uploadedTrack: UploadedTrack = {
        id: trackData.id,
        title: trackData.title,
        artist: trackData.artist,
        audioUrl: trackData.r2.audioUrl,
        coverImageUrl: trackData.r2.coverImageUrl,
        releaseDate: trackData.releaseDate,
        uploadedAt: Date.now()
      }

      setUploadedTracks((currentTracks) => [uploadedTrack, ...(currentTracks || [])])

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff00ff', '#00ffff', '#ff3366', '#ffffff']
      })

      toast.success(`${metadata.title} uploaded and synced!`)
      
      setSelectedAudioFile(null)
      setSelectedCoverImage(null)
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }
      setCoverPreview(null)
      setMetadata({ title: '', artist: 'PIKO', releaseDate: new Date().toISOString().split('T')[0] })
      setAudioUploadProgress(0)
      setCoverUploadProgress(0)

      setTimeout(() => {
        setUploadStatus('idle')
        setUploadStage('')
      }, 3000)
    } catch (error) {
      setUploadStatus('error')
      setUploadStage('Upload failed')
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setAudioUploadProgress(0)
      setCoverUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const simulateDemoUpload = async () => {
    if (!validateCredentials()) {
      toast.error('Load test credentials in the Vault tab first!')
      return
    }

    const demoTracks = [
      { title: 'Midnight Heat', artist: 'PIKO', fileName: 'midnight-heat.mp3', cover: 'midnight-heat-cover.jpg' },
      { title: 'City Lights', artist: 'PIKO', fileName: 'city-lights.mp3', cover: 'city-lights-cover.jpg' },
      { title: 'Neon Dreams', artist: 'PIKO', fileName: 'neon-dreams.mp3', cover: 'neon-dreams-cover.jpg' },
      { title: 'Street Symphony', artist: 'PIKO', fileName: 'street-symphony.mp3', cover: 'street-symphony-cover.jpg' }
    ]

    const randomTrack = demoTracks[Math.floor(Math.random() * demoTracks.length)]

    setIsUploading(true)
    setUploadStatus('uploading-audio')
    setAudioUploadProgress(0)
    setCoverUploadProgress(0)

    try {
      setUploadStage('Uploading audio to R2...')
      
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 80))
        setAudioUploadProgress(i)
      }
      
      setUploadStatus('uploading-cover')
      setUploadStage('Uploading cover image to R2...')
      
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 60))
        setCoverUploadProgress(i)
      }

      setUploadStatus('syncing')
      setUploadStage('Syncing to GitHub...')

      await new Promise(resolve => setTimeout(resolve, 800))
      
      const trackData: UploadedTrack = {
        id: Date.now().toString(),
        title: randomTrack.title,
        artist: randomTrack.artist,
        audioUrl: `https://demo.r2.dev/tracks/${Date.now()}-${randomTrack.fileName}`,
        coverImageUrl: `https://demo.r2.dev/covers/${Date.now()}-${randomTrack.cover}`,
        releaseDate: new Date().toISOString().split('T')[0],
        uploadedAt: Date.now()
      }

      setUploadStatus('success')
      setUploadStage('Complete!')

      setUploadedTracks((currentTracks) => [trackData, ...(currentTracks || [])])

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff00ff', '#00ffff', '#ff3366', '#ffffff']
      })

      toast.success(`Demo track "${randomTrack.title}" uploaded!`)
      
      setAudioUploadProgress(0)
      setCoverUploadProgress(0)

      setTimeout(() => {
        setUploadStatus('idle')
        setUploadStage('')
      }, 3000)
    } catch {
      setUploadStatus('error')
      setUploadStage('Demo upload failed')
      toast.error('Demo upload failed')
      setAudioUploadProgress(0)
      setCoverUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!validateCredentials() && (
        <Alert className="border-accent bg-accent/10">
          <AlertCircle className="w-5 h-5 text-accent" />
          <AlertDescription className="text-accent font-bold flex items-center justify-between">
            <span>Configure R2 and GitHub credentials in the Vault tab first.</span>
            <Settings className="w-4 h-4" />
          </AlertDescription>
        </Alert>
      )}

      {validateCredentials() && (
        <Alert className="border-primary bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-primary font-bold">Test Mode Active: Try the demo upload below!</span>
          </AlertDescription>
        </Alert>
      )}

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
              ref={audioFileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleAudioFileSelect(e.target.files)}
              className="hidden"
              id="track-upload"
            />

            {!selectedAudioFile ? (
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
                  <p className="font-bold text-foreground">{selectedAudioFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAudioFile(null)}
                  disabled={isUploading}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          <div className="relative border-2 border-dashed border-border hover:border-secondary/50 rounded transition-all p-6">
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverImageSelect(e.target.files)}
              className="hidden"
              id="cover-upload"
            />

            {!selectedCoverImage ? (
              <label
                htmlFor="cover-upload"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-secondary/20 group-hover:scale-110 transition-all">
                  <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
                <p className="text-sm font-black text-foreground mb-1 uppercase tracking-wide">
                  Featured Cover Art (Optional)
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WEBP • Max 5MB
                </p>
              </label>
            ) : (
              <div className="flex items-center gap-4">
                {coverPreview && (
                  <div className="w-16 h-16 rounded overflow-hidden border border-border">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{selectedCoverImage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedCoverImage.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeCoverImage}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
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
            <div className="space-y-3 p-4 rounded border border-border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(uploadStatus === 'uploading-audio' || uploadStatus === 'uploading-cover') && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {uploadStatus === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                  {uploadStatus === 'success' && <CheckCircle className="w-4 h-4 text-secondary" />}
                  {uploadStatus === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                  <span className="text-sm font-black uppercase">
                    {uploadStage || 'Processing...'}
                  </span>
                </div>
              </div>
              
              {(uploadStatus === 'uploading-audio' || uploadStatus === 'uploading-cover' || uploadStatus === 'syncing') && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground">Audio Upload</span>
                      <span className="font-bold">{audioUploadProgress}%</span>
                    </div>
                    <Progress value={audioUploadProgress} className="h-2 neon-glow-magenta" />
                  </div>

                  {selectedCoverImage && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-muted-foreground">Cover Upload</span>
                        <span className="font-bold">{coverUploadProgress}%</span>
                      </div>
                      <Progress value={coverUploadProgress} className="h-2 neon-glow-cyan" />
                    </div>
                  )}
                </>
              )}
              
              {uploadStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-secondary font-bold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Upload Complete!</span>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleUpload}
            className="w-full bg-accent hover:bg-accent/90 text-lg font-black uppercase neon-glow-orange"
            size="lg"
            disabled={!selectedAudioFile || !metadata.title.trim() || isUploading}
          >
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? 'UPLOADING...' : 'UPLOAD & SYNC'}
          </Button>

          {validateCredentials() && (
            <Button
              onClick={simulateDemoUpload}
              variant="outline"
              className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all"
              size="lg"
              disabled={isUploading}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              DEMO: Upload Random Track
            </Button>
          )}
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
                      href={track.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-secondary transition-colors"
                    >
                      Audio <ExternalLink className="w-3 h-3" />
                    </a>
                    {track.coverImageUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={track.coverImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-secondary transition-colors"
                        >
                          Cover <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
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
