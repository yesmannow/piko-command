import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '@/lib/logger'
import {
  Zap,
  Sparkles,
  Send,
  Image as ImageIcon,
  Video,
  Hash,
  TrendingUp,
  Loader2,
  Copy,
  ExternalLink,
  Upload,
  Music,
  CheckCircle,
  AlertCircle,
  Database,
  Settings,
  X,
  Link2
} from 'lucide-react'
import { YouTubeVault } from '@/components/YouTubeVault'
import { VaultSettings } from '@/components/VaultSettings'
import { TestUploadHelper } from '@/components/TestUploadHelper'
import { PlatformPreview } from '@/components/PlatformPreview'
import { SocialPreview } from '@/components/SocialPreview'
import { PromptLibrary } from '@/components/PromptLibrary'
import { HypeCalendar } from '@/components/HypeCalendar'
import { GhostwriterModal } from '@/components/GhostwriterModal'
import { OAuthCallback } from '@/components/OAuthCallback'
import { uploadAssetsToGitHub, syncTrackMetadata } from '@/lib/githubAssetUploader'
import { SocialMediaAdapter, type Platform } from '@/lib/SocialMediaAdapter'

interface PostHistory {
  id: string
  caption: string
  platforms: string[]
  timestamp: number
  linkInBio: boolean
}

interface VaultCredentials {
  githubToken: string
}

interface TrackMetadata {
  title: string
  artist: string
  vibe?: string
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

const PIKO_WEBSITE = 'https://piko-artist-website.vercel.app'

function App() {
  const [caption, setCaption] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'tiktok', 'twitter'])
  const [postHistory, setPostHistory] = useKV<PostHistory[]>('piko_post_history', [])
  const [credentials] = useKV<VaultCredentials>('vault-credentials', {
    githubToken: ''
  })
  const [uploadedTracks, setUploadedTracks] = useKV<UploadedTrack[]>('uploaded-tracks', [])
  
  const [isPosting, setIsPosting] = useState(false)
  const [showGhostwriter, setShowGhostwriter] = useState(false)
  const [showPlatformPreview, setShowPlatformPreview] = useState(false)
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [autoSuffixEnabled, setAutoSuffixEnabled] = useKV<boolean>('auto-suffix-enabled', true)
  const [currentView, setCurrentView] = useState<'composer' | 'history' | 'studio' | 'vault'>('composer')
  const [stats, setStats] = useState({ posts: 0, platforms: 0, engagement: 0 })
  const [smartLink, setSmartLink] = useState<string>(PIKO_WEBSITE)

  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<TrackMetadata>({
    title: '',
    artist: 'PIKO',
    vibe: 'Hip-Hop',
    releaseDate: new Date().toISOString().split('T')[0]
  })
  const [audioUploadProgress, setAudioUploadProgress] = useState(0)
  const [coverUploadProgress, setCoverUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'syncing' | 'success' | 'error'>('idle')
  const [uploadStage, setUploadStage] = useState<string>('')
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (postHistory) {
      const uniquePlatforms = new Set(postHistory.flatMap(p => p.platforms))
      setStats({
        posts: postHistory.length,
        platforms: uniquePlatforms.size,
        engagement: Math.min(94 + postHistory.length * 2, 100)
      })
    }
  }, [postHistory])

  const validateCredentials = () => {
    if (!credentials) return false
    return !!(credentials.githubToken)
  }

  const handleQuickShare = (videoUrl: string, videoTitle: string) => {
    const starterCaption = `🔥 ${videoTitle}\n\n${videoUrl}`
    setCaption(starterCaption)
    setCurrentView('composer')
  }

  const handleReUp = (reUpCaption: string, reUpPlatforms: string[], reUpLink?: string) => {
    setCaption(reUpCaption)
    setPlatforms(reUpPlatforms)
    if (reUpLink) {
      setSmartLink(reUpLink)
    }
    setCurrentView('composer')
  }

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }



  const handleUsePrompt = async (promptText: string) => {
    if (!caption.trim()) {
      toast.error('Enter a video link or draft caption first!')
      return
    }

    setShowPromptLibrary(false)

    try {
      const fullPrompt = `${promptText}\n\nINPUT: ${caption}`
      const response = await window.spark.llm(fullPrompt, 'gpt-4o-mini', false)
      setCaption(response)
      toast.success('Caption generated from template!')
      logger.ai('Template generation', true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`AI generation failed: ${errorMessage}`)
      logger.ai('Template generation', false, errorMessage)
    }
  }

  const handlePostSubmit = async () => {
    if (!caption.trim()) {
      toast.error('Write a caption first!')
      return
    }

    if (platforms.length === 0) {
      toast.error('Select at least one platform!')
      return
    }

    setIsPosting(true)

    try {
      let finalCaption = caption

      if (autoSuffixEnabled) {
        const suffix = `\n\n🔗 ${smartLink}\n🎵 YouTube Music: https://youtube.com/@pikomusic`
        finalCaption = `${caption}${suffix}`
      } else {
        finalCaption = `${caption}\n\n🔗 ${smartLink}`
      }

      await SocialMediaAdapter.blastToAll(platforms as Platform[], {
        caption: finalCaption,
        link: smartLink
      })

      const newPost: PostHistory = {
        id: Date.now().toString(),
        caption: finalCaption,
        platforms,
        timestamp: Date.now(),
        linkInBio: true
      }

      setPostHistory((prev) => [newPost, ...(prev || [])])

      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#bef264', '#10b981', '#22c55e', '#84cc16']
      })

      toast.success('🚀 BLAST SUCCESSFUL! Content distributed across all platforms!')
      setCaption('')
      setPlatforms(['instagram', 'tiktok', 'twitter'])
    } catch (error) {
      toast.error(`Drop failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPosting(false)
    }
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
    setUploadStatus('uploading')
    setAudioUploadProgress(0)
    setCoverUploadProgress(0)

    try {
      setUploadStage('Uploading files to GitHub...')
      
      const { audioUrl, coverImageUrl } = await uploadAssetsToGitHub(
        selectedAudioFile,
        selectedCoverImage,
        {
          title: metadata.title,
          artist: metadata.artist,
          vibe: metadata.vibe,
          releaseDate: metadata.releaseDate
        },
        {
          githubToken: credentials!.githubToken,
          githubRepo: 'piko-artist-website-v3',
          githubOwner: 'yesmannow',
        },
        (progress) => setAudioUploadProgress(progress),
        (progress) => setCoverUploadProgress(progress)
      )
      
      setUploadStatus('syncing')
      setUploadStage('Syncing track metadata...')

      await syncTrackMetadata(
        {
          title: metadata.title,
          artist: metadata.artist,
          vibe: metadata.vibe,
          releaseDate: metadata.releaseDate
        },
        audioUrl,
        coverImageUrl,
        {
          githubToken: credentials!.githubToken,
          githubRepo: 'piko-artist-website-v3',
          githubOwner: 'yesmannow',
        }
      )
      
      setUploadStatus('success')
      setUploadStage('Complete!')

      const uploadedTrack: UploadedTrack = {
        id: `track-${Date.now()}`,
        title: metadata.title,
        artist: metadata.artist,
        audioUrl: audioUrl,
        coverImageUrl: coverImageUrl,
        releaseDate: metadata.releaseDate,
        uploadedAt: Date.now()
      }

      setUploadedTracks((currentTracks) => [uploadedTrack, ...(currentTracks || [])])

      setSmartLink(audioUrl)

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff00ff', '#00ffff', '#ff3366', '#ffffff']
      })

      toast.success(`${metadata.title} uploaded and synced! Smart link ready for distribution.`)
      
      setSelectedAudioFile(null)
      setSelectedCoverImage(null)
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }
      setCoverPreview(null)
      setMetadata({ title: '', artist: 'PIKO', vibe: 'Hip-Hop', releaseDate: new Date().toISOString().split('T')[0] })
      setAudioUploadProgress(0)
      setCoverUploadProgress(0)

      setTimeout(() => {
        setUploadStatus('idle')
        setUploadStage('')
      }, 3000)
    } catch (error) {
      logger.github('track_upload', false, error instanceof Error ? error.message : 'Unknown error')
      setUploadStatus('error')
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
        
        if (errorMessage.includes('Bad credentials') || errorMessage.includes('401')) {
          errorMessage = 'GitHub authentication failed - Check your Personal Access Token'
        } else if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
          errorMessage = 'Repository not found - Verify repository access permissions'
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = 'GitHub access denied - Ensure token has repo permissions'
        } else if (errorMessage.includes('rate limit')) {
          errorMessage = 'GitHub API rate limit exceeded - Try again later'
        }
      }
      
      setUploadStage(`Failed: ${errorMessage}`)
      toast.error(`Upload failed: ${errorMessage}`)
      setAudioUploadProgress(0)
      setCoverUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const characterCount = caption.length
  const characterLimit = 2200

  const isOAuthCallback = window.location.pathname === '/oauth/callback'

  if (isOAuthCallback) {
    return <OAuthCallback />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-4xl md:text-6xl font-black uppercase tracking-wider glitch-hover cursor-pointer"
                data-text="PIKO COMMAND"
              >
                PIKO COMMAND
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
                Studio-to-Social · GitHub Native Storage · Zero-Cost Distribution
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-lime-500/10 text-lime-400 border border-lime-500/30 font-black uppercase tracking-wider px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse mr-2" />
                LIVE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={currentView === 'composer' ? 'default' : 'outline'}
            onClick={() => setCurrentView('composer')}
            className={
              currentView === 'composer'
                ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all'
                : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
            }
          >
            <Zap className="w-4 h-4 mr-2" />
            LAUNCHPAD
          </Button>
          <Button
            variant={currentView === 'studio' ? 'default' : 'outline'}
            onClick={() => setCurrentView('studio')}
            className={
              currentView === 'studio'
                ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all'
                : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
            }
          >
            <Upload className="w-4 h-4 mr-2" />
            STUDIO
          </Button>
          <Button
            variant={currentView === 'vault' ? 'default' : 'outline'}
            onClick={() => setCurrentView('vault')}
            className={
              currentView === 'vault'
                ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all'
                : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
            }
          >
            <Database className="w-4 h-4 mr-2" />
            THE VAULT
          </Button>
          <Button
            variant={currentView === 'history' ? 'default' : 'outline'}
            onClick={() => setCurrentView('history')}
            className={
              currentView === 'history'
                ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all'
                : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
            }
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            HISTORY
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'composer' && (
            <motion.div
              key="composer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bento-grid"
            >
              <Card className="bento-item-main border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl hover:border-lime-500/30 transition-all">
                <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                    <Zap className="w-7 h-7 text-lime-400" />
                    <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                      THE LAUNCHPAD
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest font-black text-zinc-400" style={{ fontFamily: 'monospace' }}>
                      CAPTION / VIDEO URL
                    </Label>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Paste YouTube link or write your caption..."
                      className="min-h-[180px] resize-none bg-zinc-950 border-0 focus:border-0 focus:ring-2 focus:ring-lime-500/20 text-base font-medium rounded-lg transition-all"
                      id="caption-input"
                      style={{ fontFamily: 'monospace' }}
                    />
                    <div className="flex items-center justify-end">
                      <span className={`text-sm font-black tabular-nums ${characterCount > characterLimit ? 'text-red-400' : 'text-zinc-500'}`}>
                        {characterCount} / {characterLimit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                      TARGET PLATFORMS
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: 'instagram', label: 'Instagram', icon: ImageIcon, type: 'clipboard' },
                        { id: 'tiktok', label: 'TikTok', icon: Video, type: 'clipboard' },
                        { id: 'twitter', label: 'X', icon: Hash, type: 'intent' },
                        { id: 'facebook', label: 'Facebook', icon: ExternalLink, type: 'intent' },
                        { id: 'linkedin', label: 'LinkedIn', icon: ExternalLink, type: 'intent' }
                      ].map(platform => (
                        <Button
                          key={platform.id}
                          variant={platforms.includes(platform.id) ? 'default' : 'outline'}
                          onClick={() => togglePlatform(platform.id)}
                          className={
                            platforms.includes(platform.id)
                              ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/20 active:scale-95 transition-all'
                              : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
                          }
                        >
                          <platform.icon className="w-4 h-4 mr-2" />
                          {platform.label}
                          {platform.type === 'clipboard' && platforms.includes(platform.id) && (
                            <Copy className="w-3 h-3 ml-2 opacity-60" />
                          )}
                        </Button>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                      <p className="text-xs text-zinc-500 flex items-center gap-2">
                        <Copy className="w-3.5 h-3.5 text-lime-400" />
                        Instagram & TikTok: Caption auto-copied, platform opens for manual paste
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                        <ExternalLink className="w-3.5 h-3.5 text-lime-400" />
                        X, Facebook, LinkedIn: Pre-filled share intents open instantly
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShowGhostwriter(true)}
                      variant="outline"
                      className="border-2 border-emerald-600/70 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all font-black uppercase tracking-wide active:scale-95"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      GHOSTWRITER AI
                    </Button>

                    <Button
                      onClick={handlePostSubmit}
                      disabled={!caption.trim() || platforms.length === 0 || isPosting}
                      className="bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-widest text-lg border-2 border-lime-400 shadow-2xl shadow-lime-400/40 active:scale-95 transition-all h-12"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                          BLASTING...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-2" />
                          BLAST ALL
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={() => setShowPlatformPreview(!showPlatformPreview)}
                    variant="outline"
                    className="w-full border-2 border-cyan-600/70 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all font-black uppercase tracking-wide active:scale-95"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {showPlatformPreview ? 'HIDE' : 'SHOW'} PLATFORM PREVIEW
                  </Button>

                  <div className="p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-lime-400" />
                        <Label className="text-xs font-black uppercase tracking-wider text-zinc-400 cursor-pointer" htmlFor="auto-suffix">
                          Auto-Suffix Links
                        </Label>
                      </div>
                      <Switch
                        id="auto-suffix"
                        checked={autoSuffixEnabled}
                        onCheckedChange={setAutoSuffixEnabled}
                      />
                    </div>
                    {autoSuffixEnabled && (
                      <div className="p-2 rounded border border-lime-600/30 bg-lime-500/5">
                        <p className="text-xs text-zinc-500">
                          Auto-appends: <span className="text-lime-400 font-mono">Smart Link + YouTube Music</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5" />
                      Auto Hashtags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['#PikoMusic', '#NewHipHop', '#YouTubeMusic'].map(tag => (
                        <Badge key={tag} className="bg-lime-500/10 text-lime-400 border border-lime-500/30 font-mono text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showPromptLibrary && (
                <div className="bento-item-ai">
                  <PromptLibrary onUsePrompt={handleUsePrompt} />
                </div>
              )}

              {showPlatformPreview && caption.trim() && (
                <div className="bento-item-ai">
                  <PlatformPreview caption={caption} selectedPlatforms={platforms} />
                </div>
              )}

              <div className="bento-item-vault">
                <YouTubeVault onQuickShare={handleQuickShare} />
              </div>

              <Card className="bento-item-stats border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                  <CardTitle className="text-lg uppercase tracking-wider font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-lime-400" />
                    <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                      STATS
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-zinc-400">Total Posts</span>
                      <span className="text-2xl font-black text-lime-400 tabular-nums">{stats.posts}</span>
                    </div>
                    <Progress value={(stats.posts / 100) * 100} className="h-2 bg-zinc-900 [&>div]:bg-lime-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-zinc-400">Platforms</span>
                      <span className="text-2xl font-black text-emerald-400 tabular-nums">{stats.platforms}</span>
                    </div>
                    <Progress value={(stats.platforms / 5) * 100} className="h-2 bg-zinc-900 [&>div]:bg-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-zinc-400">Engagement</span>
                      <span className="text-2xl font-black text-green-400 tabular-nums">{stats.engagement}%</span>
                    </div>
                    <Progress value={stats.engagement} className="h-2 bg-zinc-900 [&>div]:bg-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentView === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {!validateCredentials() && (
                <Alert className="border-2 border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <AlertDescription className="text-yellow-400 font-bold flex items-center justify-between">
                    <span>Configure GitHub credentials in THE VAULT tab first.</span>
                    <Settings className="w-4 h-4" />
                  </AlertDescription>
                </Alert>
              )}

              <TestUploadHelper />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="border-b border-zinc-800/50">
                    <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
                      <Zap className="w-6 h-6 text-lime-400" />
                      <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                        CAPTION COMPOSER
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                        CAPTION / VIDEO URL
                      </Label>
                      <Textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write your caption or paste YouTube link..."
                        className="min-h-[180px] resize-none bg-zinc-950 border-0 focus:border-0 focus:ring-2 focus:ring-lime-500/20 text-base font-medium rounded-lg transition-all"
                        id="caption-input-studio"
                        style={{ fontFamily: 'monospace' }}
                      />
                      <div className="flex items-center justify-end">
                        <span className={`text-sm font-black tabular-nums ${characterCount > characterLimit ? 'text-red-400' : 'text-zinc-500'}`}>
                          {characterCount} / {characterLimit}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                        TARGET PLATFORMS
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'instagram', label: 'Instagram', icon: ImageIcon },
                          { id: 'tiktok', label: 'TikTok', icon: Video },
                          { id: 'twitter', label: 'X', icon: Hash }
                        ].map(platform => (
                          <Button
                            key={platform.id}
                            variant={platforms.includes(platform.id) ? 'default' : 'outline'}
                            onClick={() => togglePlatform(platform.id)}
                            size="sm"
                            className={
                              platforms.includes(platform.id)
                                ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/20 active:scale-95 transition-all'
                                : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
                            }
                          >
                            <platform.icon className="w-4 h-4 mr-2" />
                            {platform.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                        SMART LINK
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={smartLink}
                          onChange={(e) => setSmartLink(e.target.value)}
                          placeholder="https://piko-artist-website.vercel.app"
                          className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSmartLink(PIKO_WEBSITE)}
                          className="border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10"
                        >
                          Reset
                        </Button>
                      </div>
                      <p className="text-xs text-zinc-600">Auto-appended to all posts</p>
                    </div>

                    <Button
                      onClick={handlePostSubmit}
                      disabled={!caption.trim() || platforms.length === 0 || isPosting}
                      className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-widest text-lg border-2 border-lime-400 shadow-2xl shadow-lime-400/40 active:scale-95 transition-all h-12"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                          BLASTING...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-2" />
                          BLAST TO ALL
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <SocialPreview caption={caption} smartLink={smartLink} />
              </div>

              <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                    <Upload className="w-7 h-7 text-lime-400" />
                    <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                      GITHUB DIRECT UPLOAD
                    </span>
                  </CardTitle>
                  <p className="text-xs text-zinc-500 mt-2">
                    Assets upload directly to yesmannow/piko-artist-website-v3 • Zero cloud costs
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="relative border-2 border-dashed border-zinc-700 hover:border-lime-500/50 rounded transition-all p-8">
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
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:bg-lime-500/20 group-hover:scale-110 transition-all">
                          <Music className="w-8 h-8 text-zinc-600 group-hover:text-lime-400 transition-colors" />
                        </div>
                        <p className="text-base font-black text-zinc-100 mb-2 uppercase tracking-wide">
                          Select Track File
                        </p>
                        <p className="text-sm text-zinc-500">
                          MP3, WAV, FLAC, or any audio format
                        </p>
                      </label>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-lime-500/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-lime-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-zinc-100">{selectedAudioFile.name}</p>
                          <p className="text-sm text-zinc-500">
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

                  <div className="relative border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded transition-all p-6">
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
                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                          <ImageIcon className="w-6 h-6 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <p className="text-sm font-black text-zinc-100 mb-1 uppercase tracking-wide">
                          Featured Cover Art (Optional)
                        </p>
                        <p className="text-xs text-zinc-500">
                          JPG, PNG, or WEBP • Max 5MB
                        </p>
                      </label>
                    ) : (
                      <div className="flex items-center gap-4">
                        {coverPreview && (
                          <div className="w-16 h-16 rounded overflow-hidden border border-zinc-700">
                            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-zinc-100 text-sm">{selectedCoverImage.name}</p>
                          <p className="text-xs text-zinc-500">
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
                    <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">Track Title</Label>
                    <Input
                      value={metadata.title}
                      onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter track name..."
                      className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-medium"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">Artist</Label>
                      <Input
                        value={metadata.artist}
                        onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                        placeholder="Artist name"
                        className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-medium"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">Vibe</Label>
                      <Input
                        value={metadata.vibe}
                        onChange={(e) => setMetadata(prev => ({ ...prev, vibe: e.target.value }))}
                        placeholder="e.g., Hip-Hop"
                        className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-medium"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">Release Date</Label>
                      <Input
                        type="date"
                        value={metadata.releaseDate}
                        onChange={(e) => setMetadata(prev => ({ ...prev, releaseDate: e.target.value }))}
                        className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-medium"
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  {uploadStatus !== 'idle' && (
                    <div className="space-y-3 p-4 rounded border-2 border-zinc-800 bg-zinc-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {uploadStatus === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-lime-400" />}
                          {uploadStatus === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
                          {uploadStatus === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                          {uploadStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                          <span className="text-sm font-black uppercase">
                            {uploadStage || 'Processing...'}
                          </span>
                        </div>
                      </div>
                      
                      {(uploadStatus === 'uploading' || uploadStatus === 'syncing') && (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-500">Audio Upload</span>
                              <span className="font-bold text-lime-400">{audioUploadProgress}%</span>
                            </div>
                            <Progress value={audioUploadProgress} className="h-2 bg-zinc-900 [&>div]:bg-lime-400" />
                          </div>

                          {selectedCoverImage && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-zinc-500">Cover Upload</span>
                                <span className="font-bold text-emerald-400">{coverUploadProgress}%</span>
                              </div>
                              <Progress value={coverUploadProgress} className="h-2 bg-zinc-900 [&>div]:bg-emerald-400" />
                            </div>
                          )}
                        </>
                      )}
                      
                      {uploadStatus === 'success' && (
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle className="w-5 h-5" />
                          <span>Upload Complete! Smart link ready.</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 text-lg font-black uppercase tracking-wider border-2 border-lime-400 shadow-2xl shadow-lime-400/40 active:scale-95 transition-all h-12"
                    disabled={!selectedAudioFile || !metadata.title.trim() || isUploading}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {isUploading ? 'UPLOADING...' : 'UPLOAD & SYNC'}
                  </Button>

                  {uploadStatus === 'error' && (
                    <Alert className="border-2 border-red-500/50 bg-red-500/10">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <AlertDescription className="text-red-400">
                        <div className="space-y-2">
                          <p className="font-bold">Common issues:</p>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            <li>Check GitHub token is correct in THE VAULT tab</li>
                            <li>Verify token has "repo" permission scope</li>
                            <li>Ensure repository yesmannow/piko-artist-website-v3 exists</li>
                            <li>Check browser console for detailed error messages</li>
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
                    <Music className="w-6 h-6 text-emerald-400" />
                    <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                      UPLOADED TRACKS
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {(!uploadedTracks || uploadedTracks.length === 0) ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-bold">No tracks uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploadedTracks.map(track => (
                        <div
                          key={track.id}
                          className="p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30 hover:border-lime-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-black text-lg mb-1">{track.title}</h3>
                              <p className="text-sm text-zinc-500">{track.artist}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Synced
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSmartLink(track.audioUrl)
                                  toast.success('Smart link updated!')
                                }}
                                className="border-lime-500/50 hover:bg-lime-500/10 hover:border-lime-500"
                              >
                                Use Link
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>{new Date(track.uploadedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <a
                              href={track.audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
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
                                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
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
            </motion.div>
          )}

          {currentView === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <VaultSettings />
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HypeCalendar onReUp={handleReUp} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GhostwriterModal
        open={showGhostwriter}
        onOpenChange={setShowGhostwriter}
        onCaptionSelect={(newCaption) => {
          setCaption(newCaption)
          setShowGhostwriter(false)
        }}
        currentCaption={caption}
      />
    </div>
  )
}

export default App
