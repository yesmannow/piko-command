import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Upload, 
  Sparkles, 
  Music, 
  Flame,
  Video,
  Clock,
  Users,
  Heart,
  MessageCircle,
  X,
  Play,
  Pause,
  Zap,
  Link as LinkIcon,
  Calendar,
  TrendingUp,
  Share2,
  Eye,
  Send,
  Settings,
  Database,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { VaultSettings } from '@/components/VaultSettings'
import { TrackManager } from '@/components/TrackManager'
import { ReleasesView } from '@/components/ReleasesView'
import { SocialMediaAuth } from '@/components/SocialMediaAuth'
import type { SocialMediaTokens } from '@/components/SocialMediaAuth'
import { postToMultiplePlatforms } from '@/lib/socialMediaAPI'

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'audio' | 'video' | 'image'
  duration?: number
  compressedSize?: number
}

interface Post {
  id: string
  content: string
  platforms: string[]
  timestamp: number
  media?: MediaFile
  smartLink?: string
  isTrackRelease?: boolean
}

interface Release {
  id: string
  trackTitle: string
  releaseDate: number
  reminded3Days?: boolean
  reminded1Day?: boolean
  remindedMidnight?: boolean
}

interface Comment {
  id: string
  platform: string
  username: string
  content: string
  timestamp: number
  replied?: boolean
}

const PLATFORM_LIMITS = {
  instagram: 2200,
  twitter: 280,
  tiktok: 2200,
  youtube: 100
}

const MOCK_COMMENTS: Comment[] = [
  { id: '1', platform: 'instagram', username: '@fanboy_99', content: '🔥🔥🔥 THIS GOES HARD', timestamp: Date.now() - 300000 },
  { id: '2', platform: 'tiktok', username: '@hiphophead', content: 'Need this on Spotify ASAP', timestamp: Date.now() - 600000 },
  { id: '3', platform: 'twitter', username: '@musiclover', content: 'Best drop of the year 💯', timestamp: Date.now() - 900000 },
  { id: '4', platform: 'instagram', username: '@realfan', content: 'When is the video dropping?', timestamp: Date.now() - 1200000 }
]

function App() {
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'tiktok'])
  const [posts, setPosts] = useKV<Post[]>('lab-posts', [])
  const [releases, setReleases] = useKV<Release[]>('lab-releases', [])
  const [socialTokens] = useKV<SocialMediaTokens>('social-tokens', {})
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null)
  const [isDropping, setIsDropping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(false)
  const [currentView, setCurrentView] = useState<'drop' | 'preview' | 'comments' | 'calendar' | 'vault' | 'studio' | 'releases' | 'social'>('drop')
  const [showLyricDialog, setShowLyricDialog] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedCaptions, setGeneratedCaptions] = useState<{quotable: string, hype: string, story: string} | null>(null)
  const [isTrackRelease, setIsTrackRelease] = useState(false)
  const [newRelease, setNewRelease] = useState({ title: '', date: '' })
  const [selectedComments, setSelectedComments] = useState<string[]>([])
  const [blastReply, setBlastReply] = useState('')
  const [metrics, setMetrics] = useState({ 
    shares: 0, 
    fireEmojis: 0, 
    comments: 0,
    engagement: 0 
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setMetrics({ 
        shares: 847, 
        fireEmojis: 2341, 
        comments: 582,
        engagement: 94
      })
    }, 300)
  }, [])

  useEffect(() => {
    checkReleaseReminders()
    const interval = setInterval(checkReleaseReminders, 60000)
    return () => clearInterval(interval)
  }, [releases])

  useEffect(() => {
    return () => {
      if (mediaFile?.preview) {
        URL.revokeObjectURL(mediaFile.preview)
      }
    }
  }, [mediaFile])

  const checkReleaseReminders = () => {
    if (!releases || releases.length === 0) return

    const now = Date.now()
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000
    const oneDayMs = 24 * 60 * 60 * 1000

    releases.forEach(release => {
      const timeUntilRelease = release.releaseDate - now

      if (timeUntilRelease <= threeDaysMs && timeUntilRelease > 0 && !release.reminded3Days) {
        toast.info(`🔥 3 days until ${release.trackTitle} drops! Time to post a teaser.`)
        setReleases(prev => prev?.map(r => 
          r.id === release.id ? { ...r, reminded3Days: true } : r
        ) || [])
      }

      if (timeUntilRelease <= oneDayMs && timeUntilRelease > 0 && !release.reminded1Day) {
        toast.info(`⚡ 1 day until ${release.trackTitle} drops! Final push!`)
        setReleases(prev => prev?.map(r => 
          r.id === release.id ? { ...r, reminded1Day: true } : r
        ) || [])
      }

      if (timeUntilRelease <= 0 && !release.remindedMidnight) {
        toast.success(`🚀 ${release.trackTitle} IS OUT NOW! Drop the announcement!`)
        setReleases(prev => prev?.map(r => 
          r.id === release.id ? { ...r, remindedMidnight: true } : r
        ) || [])
      }
    })
  }

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const isAudio = file.type.startsWith('audio/')
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isAudio && !isVideo && !isImage) {
      toast.error('Please upload an audio, video, or image file')
      return
    }

    if (file.size > 200 * 1024 * 1024) {
      toast.error('File too large (max 200MB)')
      return
    }

    const preview = URL.createObjectURL(file)
    setMediaFile({
      id: Date.now().toString(),
      file,
      preview,
      type: isAudio ? 'audio' : isVideo ? 'video' : 'image'
    })

    if (isAudio) {
      setIsTrackRelease(true)
    }

    toast.success(`${file.name} loaded`)
  }

  const removeMediaFile = () => {
    if (mediaFile?.preview) {
      URL.revokeObjectURL(mediaFile.preview)
    }
    setMediaFile(null)
    setIsTrackRelease(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const toggleVideoPlay = () => {
    const video = videoRef.current
    if (!video) return

    if (playingVideo) {
      video.pause()
      setPlayingVideo(false)
    } else {
      video.play()
      setPlayingVideo(true)
    }
  }

  const generateSmartLink = (trackTitle: string): string => {
    const slug = trackTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return `lab.link/${slug}`
  }

  const analyzeLyrics = async () => {
    if (!lyrics.trim()) {
      toast.error('Paste some lyrics first!')
      return
    }

    setIsAnalyzing(true)

    try {
      const promptText = `You are an expert hip-hop social media strategist. Analyze these lyrics and generate three caption styles:

1. "Quotable Bar" - Pick the hardest punchline/bar that fans will quote
2. "Hype Announcement" - Create an energetic announcement for the drop
3. "Story/Context" - Give context or story behind the track

Lyrics: ${lyrics}

Return a JSON object with three properties: "quotable", "hype", and "story". Each should be under 200 characters and include trending rap hashtags.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const result = JSON.parse(response)
      
      setGeneratedCaptions({
        quotable: result.quotable || '',
        hype: result.hype || '',
        story: result.story || ''
      })
    } catch (error) {
      toast.error('AI analysis failed. Try again!')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const selectCaption = (type: 'quotable' | 'hype' | 'story') => {
    if (generatedCaptions) {
      setContent(generatedCaptions[type])
      setShowLyricDialog(false)
      toast.success('Caption applied!')
    }
  }

  const handlePostDrop = async () => {
    if (!content.trim()) {
      toast.error('Write a caption!')
      return
    }

    if (platforms.length === 0) {
      toast.error('Select at least one platform!')
      return
    }

    setIsDropping(true)

    try {
      let smartLink: string | undefined
      if (isTrackRelease && mediaFile) {
        const trackTitle = content.split('\n')[0] || 'New Track'
        smartLink = generateSmartLink(trackTitle)
      }

      const finalCaption = smartLink ? `${content}\n\n🔗 ${smartLink}` : content

      const connectedPlatforms = platforms.filter(platform => {
        if (platform === 'instagram' && socialTokens?.instagram) return true
        if (platform === 'tiktok' && socialTokens?.tiktok) return true
        if (platform === 'youtube' && socialTokens?.youtube) return true
        if (platform === 'twitter' && socialTokens?.twitter) return true
        return false
      })

      if (connectedPlatforms.length > 0 && mediaFile) {
        toast.loading('Posting to connected platforms...')
        
        const postResults = await postToMultiplePlatforms(
          connectedPlatforms,
          {
            caption: finalCaption,
            mediaUrl: mediaFile.preview,
            mediaType: mediaFile.type === 'video' ? 'video' : 'image',
            mediaFile: mediaFile.file
          },
          socialTokens || {}
        )

        const successCount = postResults.filter(r => r.success).length
        const failCount = postResults.filter(r => !r.success).length

        if (successCount > 0) {
          toast.success(`Posted to ${successCount} platform(s)!`)
        }
        if (failCount > 0) {
          const failedPlatforms = postResults.filter(r => !r.success).map(r => r.platform).join(', ')
          toast.error(`Failed: ${failedPlatforms}`)
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.info('Simulated post (connect platforms in Social tab for real posting)')
      }

      const newPost: Post = {
        id: Date.now().toString(),
        content: finalCaption,
        platforms,
        timestamp: Date.now(),
        media: mediaFile || undefined,
        smartLink,
        isTrackRelease
      }

      setPosts(prev => [newPost, ...(prev || [])])

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff0080', '#00ffff', '#ffff00', '#00ff88', '#ff00ff']
      })

      toast.success('DROPPED! 🚀')
      setContent('')
      setPlatforms(['instagram', 'tiktok'])
      setMediaFile(null)
      setIsTrackRelease(false)
    } catch (error) {
      toast.error('Drop failed. Retry?')
    } finally {
      setIsDropping(false)
    }
  }

  const addRelease = () => {
    if (!newRelease.title || !newRelease.date) {
      toast.error('Enter track title and date')
      return
    }

    const release: Release = {
      id: Date.now().toString(),
      trackTitle: newRelease.title,
      releaseDate: new Date(newRelease.date).getTime()
    }

    setReleases(prev => [...(prev || []), release])
    toast.success(`${newRelease.title} scheduled!`)
    setNewRelease({ title: '', date: '' })
  }

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev =>
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    )
  }

  const blastComment = () => {
    if (selectedComments.length === 0) {
      toast.error('Select comments to reply to')
      return
    }

    if (!blastReply.trim()) {
      toast.error('Write a reply')
      return
    }

    toast.success(`Blasted reply to ${selectedComments.length} comment(s)!`)
    setSelectedComments([])
    setBlastReply('')
  }

  const getCharacterLimit = () => {
    if (platforms.includes('twitter')) return PLATFORM_LIMITS.twitter
    if (platforms.includes('youtube')) return PLATFORM_LIMITS.youtube
    return PLATFORM_LIMITS.instagram
  }

  const characterCount = content.length
  const characterLimit = getCharacterLimit()
  const isOverLimit = characterCount > characterLimit
  const isNearLimit = characterCount > characterLimit * 0.9

  return (
    <div className="min-h-screen bg-background text-foreground brick-wall">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <header className="text-center space-y-2 pt-4 pb-2">
          <h1 className="text-6xl md:text-8xl font-bold tracking-wider uppercase neon-glow-pink inline-block street-shadow tag-style" style={{ fontFamily: 'var(--font-display)' }}>
            THE LAB
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 bg-primary rounded-full neon-glow-pink"></div>
            <p className="text-secondary text-sm tracking-[0.3em] uppercase font-black tag-style">
              ARTIST COMMAND CENTER
            </p>
            <div className="h-1 w-12 bg-secondary rounded-full neon-glow-cyan"></div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={currentView === 'drop' ? 'default' : 'outline'}
            onClick={() => setCurrentView('drop')}
            className={currentView === 'drop' ? 'bg-primary text-primary-foreground neon-glow-pink font-black uppercase tracking-wider border-2 border-primary' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-primary/50'}
          >
            <Zap className="w-4 h-4 mr-2" />
            THE DROP
          </Button>
          <Button
            variant={currentView === 'preview' ? 'default' : 'outline'}
            onClick={() => setCurrentView('preview')}
            className={currentView === 'preview' ? 'bg-primary text-primary-foreground neon-glow-pink font-black uppercase tracking-wider border-2 border-primary' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-primary/50'}
          >
            <Eye className="w-4 h-4 mr-2" />
            PREVIEW
          </Button>
          <Button
            variant={currentView === 'comments' ? 'default' : 'outline'}
            onClick={() => setCurrentView('comments')}
            className={currentView === 'comments' ? 'bg-primary text-primary-foreground neon-glow-pink font-black uppercase tracking-wider border-2 border-primary' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-primary/50'}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            COMMENTS
          </Button>
          <Button
            variant={currentView === 'calendar' ? 'default' : 'outline'}
            onClick={() => setCurrentView('calendar')}
            className={currentView === 'calendar' ? 'bg-primary text-primary-foreground neon-glow-pink font-black uppercase tracking-wider border-2 border-primary' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-primary/50'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            RELEASES
          </Button>
          <Button
            variant={currentView === 'studio' ? 'default' : 'outline'}
            onClick={() => setCurrentView('studio')}
            className={currentView === 'studio' ? 'bg-accent text-accent-foreground neon-glow-yellow font-black uppercase tracking-wider border-2 border-accent' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-accent/50'}
          >
            <Database className="w-4 h-4 mr-2" />
            STUDIO
          </Button>
          <Button
            variant={currentView === 'releases' ? 'default' : 'outline'}
            onClick={() => setCurrentView('releases')}
            className={currentView === 'releases' ? 'bg-secondary text-secondary-foreground neon-glow-cyan font-black uppercase tracking-wider border-2 border-secondary' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-secondary/50'}
          >
            <Music className="w-4 h-4 mr-2" />
            RELEASES
          </Button>
          <Button
            variant={currentView === 'vault' ? 'default' : 'outline'}
            onClick={() => setCurrentView('vault')}
            className={currentView === 'vault' ? 'bg-primary text-primary-foreground neon-glow-pink font-black uppercase tracking-wider border-2 border-primary' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-primary/50'}
          >
            <Settings className="w-4 h-4 mr-2" />
            VAULT
          </Button>
          <Button
            variant={currentView === 'social' ? 'default' : 'outline'}
            onClick={() => setCurrentView('social')}
            className={currentView === 'social' ? 'bg-accent text-accent-foreground neon-glow-yellow font-black uppercase tracking-wider border-2 border-accent' : 'border-2 border-border/50 font-bold uppercase tracking-wide hover:border-accent/50'}
          >
            <Users className="w-4 h-4 mr-2" />
            SOCIAL
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'drop' && (
            <motion.div
              key="drop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {!socialTokens?.instagram && !socialTokens?.tiktok && !socialTokens?.youtube && (
                <div className="lg:col-span-3">
                  <Alert className="border-2 border-accent bg-accent/10 neon-glow-yellow">
                    <Users className="w-5 h-5 text-accent" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-accent font-black uppercase tracking-wide">
                        Connect social accounts in the SOCIAL tab for real multi-platform posting
                      </span>
                      <Button
                        onClick={() => setCurrentView('social')}
                        variant="outline"
                        size="sm"
                        className="border-2 border-accent/70 hover:bg-accent/20 font-bold uppercase"
                      >
                        Connect Now
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Card className="studio-card lg:col-span-2 graffiti-texture">
                <CardHeader>
                  <CardTitle className="text-3xl uppercase tracking-wide flex items-center gap-3 tag-style">
                    <Zap className="w-7 h-7 text-primary neon-glow-pink" />
                    <span className="street-shadow">THE DROP</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}
                    className={`
                      relative border-4 border-dashed rounded-lg transition-all
                      ${isDragging 
                        ? 'border-primary bg-primary/20 scale-[1.02] neon-glow-pink' 
                        : 'border-border/50 hover:border-primary/50'
                      }
                      ${mediaFile ? 'p-3' : 'p-8'}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,video/*,image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="media-upload"
                    />

                    {!mediaFile ? (
                      <label
                        htmlFor="media-upload"
                        className="flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <div className="w-20 h-20 rounded-lg bg-muted/50 border-2 border-dashed border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all group-hover:neon-glow-pink group-hover:border-primary">
                          <Upload className="w-9 h-9 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-lg font-black text-foreground mb-2 uppercase tracking-widest tag-style">
                          Drop Your Track Here
                        </p>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wide">
                          Audio, Video, or Image • Max 200MB
                        </p>
                      </label>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden bg-muted/50 border-2 border-primary/30">
                          {mediaFile.type === 'audio' && (
                            <div className="p-6 flex items-center gap-4">
                              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow-pink">
                                <Music className="w-10 h-10 text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="font-black text-foreground text-lg uppercase tracking-wide">{mediaFile.file.name}</p>
                                <p className="text-sm text-secondary font-bold">
                                  {(mediaFile.file.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          )}

                          {mediaFile.type === 'video' && (
                            <div className="relative aspect-video">
                              <video
                                ref={videoRef}
                                src={mediaFile.preview}
                                className="w-full h-full object-cover"
                                loop
                                muted
                                playsInline
                              />
                              <button
                                onClick={toggleVideoPlay}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                              >
                                {playingVideo ? (
                                  <Pause className="w-12 h-12 text-white" />
                                ) : (
                                  <Play className="w-12 h-12 text-white" />
                                )}
                              </button>
                            </div>
                          )}

                          {mediaFile.type === 'image' && (
                            <img
                              src={mediaFile.preview}
                              alt="Upload preview"
                              className="w-full object-cover max-h-96"
                            />
                          )}

                          <button
                            onClick={removeMediaFile}
                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-all hover:scale-110 neon-glow-orange border-2 border-destructive-foreground/20"
                          >
                            <X className="w-6 h-6 text-destructive-foreground font-bold" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {mediaFile && isTrackRelease && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/20 border-2 border-secondary/50 neon-glow-cyan">
                      <LinkIcon className="w-6 h-6 text-secondary" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-foreground uppercase tracking-wide">Smart Link Enabled</p>
                        <p className="text-xs text-secondary font-bold">
                          Auto-generated link will be added to all posts
                        </p>
                      </div>
                    </div>
                  )}

                  <Textarea
                    id="post-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your caption..."
                    className="min-h-[150px] resize-none bg-muted/30 border-2 border-border/50 focus:border-primary focus:ring-primary/50 text-base rounded-lg"
                  />

                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={platforms.includes('instagram')}
                          onCheckedChange={() => togglePlatform('instagram')}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2"
                        />
                        <span className="text-sm font-black uppercase flex items-center gap-1 tag-style">
                          IG Reels
                          {socialTokens?.instagram && (
                            <CheckCircle className="w-4 h-4 text-secondary neon-glow-cyan" />
                          )}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={platforms.includes('tiktok')}
                          onCheckedChange={() => togglePlatform('tiktok')}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2"
                        />
                        <span className="text-sm font-black uppercase flex items-center gap-1 tag-style">
                          TikTok
                          {socialTokens?.tiktok && (
                            <CheckCircle className="w-4 h-4 text-secondary neon-glow-cyan" />
                          )}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={platforms.includes('youtube')}
                          onCheckedChange={() => togglePlatform('youtube')}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2"
                        />
                        <span className="text-sm font-black uppercase flex items-center gap-1 tag-style">
                          YT Shorts
                          {socialTokens?.youtube && (
                            <CheckCircle className="w-4 h-4 text-secondary neon-glow-cyan" />
                          )}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={platforms.includes('twitter')}
                          onCheckedChange={() => togglePlatform('twitter')}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2"
                        />
                        <span className="text-sm font-black uppercase flex items-center gap-1 tag-style">
                          X
                          {socialTokens?.twitter && (
                            <CheckCircle className="w-4 h-4 text-secondary neon-glow-cyan" />
                          )}
                        </span>
                      </label>
                    </div>

                    <div className={`text-sm font-black uppercase tag-style ${isOverLimit ? 'text-destructive neon-glow-orange' : isNearLimit ? 'text-accent neon-glow-yellow' : 'text-muted-foreground'}`}>
                      {characterCount} / {characterLimit}
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowLyricDialog(true)}
                      variant="outline"
                      className="flex-1 border-2 border-secondary/70 hover:bg-secondary/20 hover:border-secondary transition-all font-black uppercase tracking-wide neon-glow-cyan"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Extract Bars
                    </Button>

                    <Button
                      onClick={handlePostDrop}
                      className="flex-1 bg-primary hover:bg-primary/90 hover:scale-105 neon-glow-pink transition-all text-xl font-black uppercase tracking-widest border-2 border-primary-foreground/10"
                      disabled={!content.trim() || platforms.length === 0 || isOverLimit || isDropping}
                      size="lg"
                    >
                      <Zap className="w-6 h-6 mr-2" />
                      {isDropping ? 'DROPPING...' : 'DROP IT'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="studio-card graffiti-texture">
                <CardHeader>
                  <CardTitle className="text-3xl uppercase tracking-wide flex items-center gap-3 tag-style">
                    <Flame className="w-7 h-7 text-accent neon-glow-yellow" />
                    <span className="street-shadow">HYPE METERS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-secondary neon-glow-cyan" />
                        <span className="text-sm font-black uppercase tag-style">Shares</span>
                      </div>
                      <span className="text-3xl font-black tabular-nums text-secondary">{metrics.shares}</span>
                    </div>
                    <Progress value={(metrics.shares / 1000) * 100} className="h-4 neon-glow-cyan border border-secondary/30" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-accent neon-glow-yellow" />
                        <span className="text-sm font-black uppercase tag-style">Fire 🔥</span>
                      </div>
                      <span className="text-3xl font-black tabular-nums text-accent">{metrics.fireEmojis}</span>
                    </div>
                    <Progress value={(metrics.fireEmojis / 3000) * 100} className="h-4 neon-glow-yellow border border-accent/30" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary neon-glow-pink" />
                        <span className="text-sm font-black uppercase tag-style">Comments</span>
                      </div>
                      <span className="text-3xl font-black tabular-nums text-primary">{metrics.comments}</span>
                    </div>
                    <Progress value={(metrics.comments / 1000) * 100} className="h-4 neon-glow-pink border border-primary/30" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-secondary neon-glow-cyan" />
                        <span className="text-sm font-black uppercase tag-style">Engagement</span>
                      </div>
                      <span className="text-3xl font-black tabular-nums text-secondary">{metrics.engagement}%</span>
                    </div>
                    <Progress value={metrics.engagement} className="h-4 neon-glow-cyan border border-secondary/30" />
                  </div>
                </CardContent>
              </Card>

              {posts && posts.length > 0 && (
                <Card className="studio-card lg:col-span-3 graffiti-texture">
                  <CardHeader>
                    <CardTitle className="text-3xl uppercase tracking-wide flex items-center gap-3 tag-style">
                      <Clock className="w-7 h-7 text-primary neon-glow-pink" />
                      <span className="street-shadow">RECENT DROPS</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="w-full">
                      <div className="flex gap-4 pb-4">
                        {posts.slice(0, 10).map((post) => (
                          <Card 
                            key={post.id} 
                            className="studio-card w-[280px] flex-shrink-0 hover:border-primary/70 hover:neon-glow-pink transition-all cursor-pointer group border-2"
                          >
                            <CardContent className="p-4 space-y-3">
                              {post.media && (
                                <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-primary/20">
                                  {post.media.type === 'video' && (
                                    <video src={post.media.preview} className="w-full h-full object-cover" muted />
                                  )}
                                  {post.media.type === 'image' && (
                                    <img src={post.media.preview} alt="Post" className="w-full h-full object-cover" />
                                  )}
                                  {post.media.type === 'audio' && (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                                      <Music className="w-20 h-20 text-primary-foreground" />
                                    </div>
                                  )}
                                </div>
                              )}

                              <p className="text-sm line-clamp-3 font-medium">{post.content}</p>
                              
                              <div className="flex gap-2 flex-wrap">
                                {post.platforms.map(platform => (
                                  <Badge key={platform} variant="secondary" className="text-xs uppercase font-black tag-style border border-secondary/30">
                                    {platform}
                                  </Badge>
                                ))}
                              </div>

                              {post.smartLink && (
                                <div className="flex items-center gap-2 text-xs text-secondary font-bold">
                                  <LinkIcon className="w-4 h-4" />
                                  <span className="font-mono">{post.smartLink}</span>
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground font-bold uppercase">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {currentView === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="studio-card">
                <CardHeader>
                  <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
                    <Eye className="w-6 h-6 text-primary" />
                    MULTI-PLATFORM PREVIEW
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!mediaFile ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-base font-bold uppercase">Upload media to see previews</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-black uppercase text-center">IG Reels</p>
                        <div className="aspect-[9/16] bg-muted rounded border border-border overflow-hidden">
                          {mediaFile.type === 'video' && (
                            <video src={mediaFile.preview} className="w-full h-full object-cover" muted loop autoPlay />
                          )}
                          {mediaFile.type === 'image' && (
                            <img src={mediaFile.preview} alt="IG preview" className="w-full h-full object-cover" />
                          )}
                          {mediaFile.type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-12 h-12 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-black uppercase text-center">TikTok</p>
                        <div className="aspect-[9/16] bg-muted rounded border border-border overflow-hidden">
                          {mediaFile.type === 'video' && (
                            <video src={mediaFile.preview} className="w-full h-full object-cover" muted loop autoPlay />
                          )}
                          {mediaFile.type === 'image' && (
                            <img src={mediaFile.preview} alt="TikTok preview" className="w-full h-full object-cover" />
                          )}
                          {mediaFile.type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-12 h-12 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-black uppercase text-center">YT Shorts</p>
                        <div className="aspect-[9/16] bg-muted rounded border border-border overflow-hidden">
                          {mediaFile.type === 'video' && (
                            <video src={mediaFile.preview} className="w-full h-full object-cover" muted loop autoPlay />
                          )}
                          {mediaFile.type === 'image' && (
                            <img src={mediaFile.preview} alt="YouTube preview" className="w-full h-full object-cover" />
                          )}
                          {mediaFile.type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-12 h-12 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-black uppercase text-center">X (Twitter)</p>
                        <div className="aspect-[16/9] bg-muted rounded border border-border overflow-hidden">
                          {mediaFile.type === 'video' && (
                            <video src={mediaFile.preview} className="w-full h-full object-cover" muted loop autoPlay />
                          )}
                          {mediaFile.type === 'image' && (
                            <img src={mediaFile.preview} alt="X preview" className="w-full h-full object-cover" />
                          )}
                          {mediaFile.type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-10 h-10 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentView === 'comments' && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="studio-card">
                <CardHeader>
                  <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    UNIFIED COMMENTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {MOCK_COMMENTS.map(comment => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded border transition-all cursor-pointer ${
                          selectedComments.includes(comment.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleCommentSelection(comment.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedComments.includes(comment.id)}
                            onCheckedChange={() => toggleCommentSelection(comment.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs uppercase">
                                {comment.platform}
                              </Badge>
                              <span className="text-sm font-bold">{comment.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {Math.floor((Date.now() - comment.timestamp) / 60000)}m ago
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedComments.length > 0 && (
                    <div className="space-y-3 p-4 rounded border border-secondary bg-secondary/5">
                      <Label className="text-sm font-black uppercase">
                        Blast Reply ({selectedComments.length} selected)
                      </Label>
                      <Textarea
                        value={blastReply}
                        onChange={(e) => setBlastReply(e.target.value)}
                        placeholder="Type your reply..."
                        className="bg-muted/50"
                      />
                      <Button
                        onClick={blastComment}
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Blast to All
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentView === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="studio-card">
                <CardHeader>
                  <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    RELEASE CALENDAR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-border">
                    <div className="space-y-2">
                      <Label className="text-sm font-black uppercase">Track Title</Label>
                      <Input
                        value={newRelease.title}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter track name..."
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-black uppercase">Release Date</Label>
                      <Input
                        type="date"
                        value={newRelease.date}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={addRelease} className="w-full bg-primary">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Release
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {(!releases || releases.length === 0) ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No scheduled releases</p>
                      </div>
                    ) : (
                      releases.map(release => (
                        <div
                          key={release.id}
                          className="p-4 rounded border border-border hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-black text-lg">{release.trackTitle}</h3>
                            <Badge variant="secondary">
                              {new Date(release.releaseDate).toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {release.reminded3Days && (
                              <Badge className="text-xs bg-secondary/20 text-secondary">3 Days ✓</Badge>
                            )}
                            {release.reminded1Day && (
                              <Badge className="text-xs bg-secondary/20 text-secondary">1 Day ✓</Badge>
                            )}
                            {release.remindedMidnight && (
                              <Badge className="text-xs bg-primary/20 text-primary">Dropped ✓</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
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
            >
              <TrackManager />
            </motion.div>
          )}

          {currentView === 'releases' && (
            <motion.div
              key="releases"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReleasesView />
            </motion.div>
          )}

          {currentView === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VaultSettings />
            </motion.div>
          )}

          {currentView === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SocialMediaAuth />
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={showLyricDialog} onOpenChange={setShowLyricDialog}>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI Lyric Analysis
              </DialogTitle>
              <DialogDescription>
                Paste your lyrics and let AI extract the hardest bars for captions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your lyrics here..."
                className="min-h-[200px] bg-muted/50"
              />

              <Button
                onClick={analyzeLyrics}
                className="w-full bg-primary"
                disabled={isAnalyzing || !lyrics.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Extract Bars'}
              </Button>

              {generatedCaptions && (
                <Tabs defaultValue="quotable" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="quotable">Quotable</TabsTrigger>
                    <TabsTrigger value="hype">Hype</TabsTrigger>
                    <TabsTrigger value="story">Story</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="quotable" className="space-y-2">
                    <Card className="studio-card">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm">{generatedCaptions.quotable}</p>
                        <Button 
                          size="sm" 
                          onClick={() => selectCaption('quotable')}
                          className="w-full bg-primary"
                        >
                          Use This
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="hype" className="space-y-2">
                    <Card className="studio-card">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm">{generatedCaptions.hype}</p>
                        <Button 
                          size="sm" 
                          onClick={() => selectCaption('hype')}
                          className="w-full bg-secondary text-secondary-foreground"
                        >
                          Use This
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="story" className="space-y-2">
                    <Card className="studio-card">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm">{generatedCaptions.story}</p>
                        <Button 
                          size="sm" 
                          onClick={() => selectCaption('story')}
                          className="w-full bg-accent text-accent-foreground"
                        >
                          Use This
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App
