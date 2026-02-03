import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Send, 
  Sparkles, 
  Music, 
  TrendingUp, 
  Image as ImageIcon,
  RotateCcw,
  Instagram,
  Twitter,
  Video,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Upload,
  X,
  Play,
  Pause
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}

interface Post {
  id: string
  content: string
  platforms: string[]
  timestamp: number
  media?: MediaFile[]
}

interface Track {
  id: string
  title: string
  artwork: string
  releaseDate: string
}

const PLATFORM_LIMITS = {
  instagram: 2200,
  twitter: 280,
  tiktok: 2200
}

const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'NEON DREAMS',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    releaseDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'MIDNIGHT PROTOCOL',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    releaseDate: '2024-02-20'
  },
  {
    id: '3',
    title: 'CYBER FLOW',
    artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    releaseDate: '2024-03-10'
  }
]

function App() {
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [posts, setPosts] = useKV<Post[]>('piko-posts', [] as Post[])
  const [isGhostwriterOpen, setIsGhostwriterOpen] = useState(false)
  const [ghostwriterContent, setGhostwriterContent] = useState<{street: string, promo: string, viral: string} | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [metrics, setMetrics] = useState({ followers: 0, engagement: 0, posts: 0 })
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  useEffect(() => {
    setTimeout(() => {
      setMetrics({ followers: 87, engagement: 94, posts: 156 })
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      mediaFiles.forEach(media => {
        URL.revokeObjectURL(media.preview)
      })
    }
  }, [mediaFiles])

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles: MediaFile[] = []
    const maxFiles = 4
    const currentCount = mediaFiles.length

    if (currentCount >= maxFiles) {
      toast.error(`Maximum ${maxFiles} media files allowed`)
      return
    }

    Array.from(files).forEach((file, index) => {
      if (currentCount + newFiles.length >= maxFiles) return

      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a valid image or video`)
        return
      }

      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 100MB)`)
        return
      }

      const preview = URL.createObjectURL(file)
      newFiles.push({
        id: `${Date.now()}-${index}`,
        file,
        preview,
        type: isImage ? 'image' : 'video'
      })
    })

    if (newFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...newFiles])
      toast.success(`${newFiles.length} file(s) added`)
    }
  }

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const toggleVideoPlay = (id: string) => {
    const video = videoRefs.current[id]
    if (!video) return

    if (playingVideo === id) {
      video.pause()
      setPlayingVideo(null)
    } else {
      if (playingVideo && videoRefs.current[playingVideo]) {
        videoRefs.current[playingVideo]?.pause()
      }
      video.play()
      setPlayingVideo(id)
    }
  }

  const getCharacterLimit = () => {
    if (platforms.includes('twitter')) return PLATFORM_LIMITS.twitter
    return PLATFORM_LIMITS.instagram
  }

  const characterCount = content.length
  const characterLimit = getCharacterLimit()
  const isOverLimit = characterCount > characterLimit
  const isNearLimit = characterCount > characterLimit * 0.9

  const handleGhostwriter = async () => {
    if (!content.trim()) {
      toast.error('Write something first!')
      return
    }

    setIsGhostwriterOpen(true)
    setIsGenerating(true)

    try {
      const response = await window.spark.llm(
        `You are a social media ghostwriter for hip-hop artist PIKO. Take the following draft and create THREE distinct versions:

1. "Street Hype" - Raw, energetic, uses slang and hype language, all caps for emphasis
2. "Promotional" - Professional but cool, focused on engagement and CTA
3. "Viral" - Short, punchy, meme-able, designed for maximum shares

Original draft: ${content}

Return a JSON object with three properties: "street", "promo", and "viral". Each should be a complete rewrite optimized for that style. Keep under ${characterLimit} characters.`,
        'gpt-4o-mini',
        true
      )
      const result = JSON.parse(response)
      
      setGhostwriterContent({
        street: result.street || result.Street || '',
        promo: result.promo || result.Promo || result.promotional || '',
        viral: result.viral || result.Viral || ''
      })
    } catch (error) {
      toast.error('AI remix failed. Try again!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectRemix = (type: 'street' | 'promo' | 'viral') => {
    if (ghostwriterContent) {
      setContent(ghostwriterContent[type])
      setIsGhostwriterOpen(false)
      toast.success('Remix applied!')
    }
  }

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error('Write something to post!')
      return
    }

    if (platforms.length === 0) {
      toast.error('Select at least one platform!')
      return
    }

    if (isOverLimit) {
      toast.error('Content exceeds character limit!')
      return
    }

    setIsSending(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newPost: Post = {
        id: Date.now().toString(),
        content,
        platforms,
        timestamp: Date.now(),
        media: mediaFiles.length > 0 ? mediaFiles : undefined
      }

      setPosts(prev => [newPost, ...(prev || [])])

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#bef264', '#ffffff']
      })

      toast.success('Post sent to the world! 🚀')
      setContent('')
      setPlatforms(['instagram'])
      setMediaFiles([])
    } catch (error) {
      toast.error('Failed to send. Retry?')
    } finally {
      setIsSending(false)
    }
  }

  const handleRepublish = (post: Post) => {
    setContent(post.content)
    setPlatforms(post.platforms)
    if (post.media) {
      setMediaFiles(post.media)
    }
    toast.success('Post loaded into composer')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
            PIKO COMMAND
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide">
            SOCIAL MEDIA DISTRIBUTION HUB
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="glass-card md:col-span-2 lg:col-span-2 lg:row-span-2">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
                <Send className="w-5 h-5" />
                THE COMPOSER
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's the vibe today?"
                className="min-h-[200px] resize-none bg-zinc-950/50 border-zinc-800 focus:border-primary focus:ring-primary/50 text-base"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg transition-all
                  ${isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-zinc-800 hover:border-zinc-700'
                  }
                  ${mediaFiles.length > 0 ? 'p-3' : 'p-6'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="media-upload"
                />

                {mediaFiles.length === 0 ? (
                  <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Drop media here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images & videos up to 100MB (max 4 files)
                    </p>
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <AnimatePresence>
                        {mediaFiles.map((media) => (
                          <motion.div
                            key={media.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800"
                          >
                            {media.type === 'image' ? (
                              <img
                                src={media.preview}
                                alt="Upload preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="relative w-full h-full">
                                <video
                                  ref={el => { videoRefs.current[media.id] = el }}
                                  src={media.preview}
                                  className="w-full h-full object-cover"
                                  loop
                                  muted
                                  playsInline
                                />
                                <button
                                  onClick={() => toggleVideoPlay(media.id)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {playingVideo === media.id ? (
                                    <Pause className="w-8 h-8 text-white" />
                                  ) : (
                                    <Play className="w-8 h-8 text-white" />
                                  )}
                                </button>
                              </div>
                            )}

                            <div className="absolute top-1 left-1">
                              <Badge variant="secondary" className="text-xs">
                                {media.type === 'image' ? (
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                ) : (
                                  <Video className="w-3 h-3 mr-1" />
                                )}
                                {media.type}
                              </Badge>
                            </div>

                            <button
                              onClick={() => removeMediaFile(media.id)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            >
                              <X className="w-4 h-4 text-destructive-foreground" />
                            </button>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs text-white truncate">
                                {media.file.name}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {mediaFiles.length < 4 && (
                      <label
                        htmlFor="media-upload"
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-primary/50 cursor-pointer transition-all group"
                      >
                        <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Add more media</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={platforms.includes('instagram')}
                      onCheckedChange={() => togglePlatform('instagram')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm font-medium">IG</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={platforms.includes('twitter')}
                      onCheckedChange={() => togglePlatform('twitter')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm font-medium">X</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={platforms.includes('tiktok')}
                      onCheckedChange={() => togglePlatform('tiktok')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Video className="w-4 h-4" />
                    <span className="text-sm font-medium">TikTok</span>
                  </label>
                </div>

                <div className={`text-sm font-medium ${isOverLimit ? 'text-destructive' : isNearLimit ? 'text-secondary' : 'text-muted-foreground'}`}>
                  {characterCount} / {characterLimit}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleGhostwriter}
                  variant="outline"
                  className="flex-1 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all"
                  disabled={!content.trim() || isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Ghostwriter'}
                </Button>

                <Button
                  onClick={handleSend}
                  className="flex-1 bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 transition-all"
                  disabled={!content.trim() || platforms.length === 0 || isOverLimit || isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>

              {isGhostwriterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Tabs defaultValue="street" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900/60">
                      <TabsTrigger value="street">Street Hype</TabsTrigger>
                      <TabsTrigger value="promo">Promo</TabsTrigger>
                      <TabsTrigger value="viral">Viral</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="street" className="space-y-2">
                      <Card className="bg-zinc-950/50 border-zinc-800">
                        <CardContent className="p-4">
                          {isGenerating ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                              <div className="h-4 bg-zinc-800 rounded w-full"></div>
                              <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm mb-3">{ghostwriterContent?.street}</p>
                              <Button 
                                size="sm" 
                                onClick={() => selectRemix('street')}
                                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                              >
                                Use This
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="promo" className="space-y-2">
                      <Card className="bg-zinc-950/50 border-zinc-800">
                        <CardContent className="p-4">
                          {isGenerating ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                              <div className="h-4 bg-zinc-800 rounded w-full"></div>
                              <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm mb-3">{ghostwriterContent?.promo}</p>
                              <Button 
                                size="sm" 
                                onClick={() => selectRemix('promo')}
                                className="w-full bg-primary hover:bg-primary/90"
                              >
                                Use This
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="viral" className="space-y-2">
                      <Card className="bg-zinc-950/50 border-zinc-800">
                        <CardContent className="p-4">
                          {isGenerating ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                              <div className="h-4 bg-zinc-800 rounded w-full"></div>
                              <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm mb-3">{ghostwriterContent?.viral}</p>
                              <Button 
                                size="sm" 
                                onClick={() => selectRemix('viral')}
                                className="w-full bg-primary hover:bg-primary/90"
                              >
                                Use This
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card lg:row-span-2">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
                <Music className="w-5 h-5" />
                THE VAULT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_TRACKS.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-950/50 border-zinc-800 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden">
                    <CardContent className="p-3 flex gap-3 items-center">
                      <img 
                        src={track.artwork} 
                        alt={track.title}
                        className="w-16 h-16 rounded object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                        <p className="text-xs text-muted-foreground">{track.releaseDate}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5" />
                LIVE FEED
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!posts || posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts yet. Create your first one!</p>
                </div>
              ) : (
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-zinc-950/50 border-zinc-800 hover:border-primary/50 transition-all w-[280px] flex-shrink-0 group">
                          <CardContent className="p-4 space-y-3">
                            {post.media && post.media.length > 0 && (
                              <div className="grid grid-cols-2 gap-1 mb-2 rounded-md overflow-hidden">
                                {post.media.slice(0, 4).map((media) => (
                                  <div
                                    key={media.id}
                                    className="aspect-square bg-zinc-900 relative"
                                  >
                                    {media.type === 'image' ? (
                                      <img
                                        src={media.preview}
                                        alt="Post media"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="relative w-full h-full">
                                        <video
                                          src={media.preview}
                                          className="w-full h-full object-cover"
                                          muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                          <Video className="w-6 h-6 text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="text-sm line-clamp-3">{post.content}</p>
                            
                            <div className="flex gap-2 flex-wrap">
                              {post.platforms.map(platform => (
                                <Badge key={platform} variant="secondary" className="text-xs">
                                  {platform === 'instagram' && <Instagram className="w-3 h-3 mr-1" />}
                                  {platform === 'twitter' && <Twitter className="w-3 h-3 mr-1" />}
                                  {platform === 'tiktok' && <Video className="w-3 h-3 mr-1" />}
                                  {platform}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRepublish(post)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Repost
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                HYPE METRICS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Followers</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.followers}K</span>
                </div>
                <Progress value={metrics.followers} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.engagement}%</span>
                </div>
                <Progress value={metrics.engagement} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Total Posts</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.posts}</span>
                </div>
                <Progress value={(metrics.posts / 200) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
