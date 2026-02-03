import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Youtube,
  Zap,
  Sparkles,
  Send,
  Image as ImageIcon,
  Video,
  Hash,
  TrendingUp,
  Play,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { YouTubeVault } from '@/components/YouTubeVault'

interface PostHistory {
  id: string
  caption: string
  platforms: string[]
  timestamp: number
  linkInBio: boolean
}

interface CaptionVariant {
  hype: string
  promo: string
  viral: string
}

const PIKO_WEBSITE = 'https://piko-artist-website.vercel.app'

function App() {
  const [caption, setCaption] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'tiktok', 'twitter'])
  const [postHistory, setPostHistory] = useKV<PostHistory[]>('piko_post_history', [])
  const [isPosting, setIsPosting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionVariant | null>(null)
  const [showCaptionDialog, setShowCaptionDialog] = useState(false)
  const [currentView, setCurrentView] = useState<'composer' | 'history'>('composer')
  const [stats, setStats] = useState({ posts: 0, platforms: 0, engagement: 0 })

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

  const handleQuickShare = (videoUrl: string, videoTitle: string) => {
    const starterCaption = `🔥 ${videoTitle}\n\n${videoUrl}`
    setCaption(starterCaption)
    setCurrentView('composer')
  }

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const generateCaptions = async () => {
    if (!caption.trim()) {
      toast.error('Enter a video link or draft caption first!')
      return
    }

    setIsGenerating(true)

    try {
      const promptText = `You are the Creative Director for PIKO, a YouTube-focused hip-hop artist. Generate 3 caption styles for this content:

INPUT: ${caption}

Generate exactly 3 caption styles optimized for different platforms. Return a JSON object with these exact keys:

1. "hype": Street-level energy, heavy on emojis (🔥, 💿, 🚀). Focus on excitement and energy. Include #PikoMusic #NewHipHop #YouTubeMusic
2. "promo": Clean, professional, call-to-action focused. Clear message with strong CTA. Include relevant hashtags.
3. "viral": Short, punchy, designed for TikTok/X. Maximum engagement focus. Under 150 characters.

Voice: Authentic, Street, Technical, Energetic. Keep captions under 200 characters except viral which should be under 150.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const result = JSON.parse(response)

      setGeneratedCaptions({
        hype: result.hype || '',
        promo: result.promo || '',
        viral: result.viral || ''
      })

      setShowCaptionDialog(true)
      toast.success('3 caption styles generated!')
    } catch (error) {
      toast.error('AI generation failed. Try again!')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectCaption = (variant: keyof CaptionVariant) => {
    if (generatedCaptions) {
      setCaption(generatedCaptions[variant])
      setShowCaptionDialog(false)
      toast.success('Caption applied!')
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
      const finalCaption = `${caption}\n\n🔗 ${PIKO_WEBSITE}`

      const twitterPlatforms = platforms.filter(p => ['twitter', 'facebook', 'linkedin'].includes(p))
      const clipboardPlatforms = platforms.filter(p => ['instagram', 'tiktok'].includes(p))

      if (clipboardPlatforms.length > 0) {
        try {
          await navigator.clipboard.writeText(finalCaption)
          toast.success('Caption copied for IG/TikTok! Launching platforms...')
        } catch (err) {
          toast.error('Clipboard access denied. Copy manually.')
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        clipboardPlatforms.forEach(platform => {
          if (platform === 'instagram') {
            window.open('https://www.instagram.com/', '_blank')
          } else if (platform === 'tiktok') {
            window.open('https://www.tiktok.com/upload', '_blank')
          }
        })
      }

      if (twitterPlatforms.length > 0) {
        twitterPlatforms.forEach(platform => {
          if (platform === 'twitter') {
            const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalCaption)}`
            window.open(twitterIntentUrl, '_blank')
          } else if (platform === 'facebook') {
            const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(PIKO_WEBSITE)}&quote=${encodeURIComponent(finalCaption)}`
            window.open(facebookIntentUrl, '_blank')
          } else if (platform === 'linkedin') {
            const linkedinIntentUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(PIKO_WEBSITE)}`
            window.open(linkedinIntentUrl, '_blank')
          }
        })
      }

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

      toast.success('DROPPED! 🚀')
      setCaption('')
      setPlatforms(['instagram', 'tiktok', 'twitter'])
    } catch (error) {
      toast.error(`Drop failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPosting(false)
    }
  }

  const characterCount = caption.length
  const characterLimit = 2200

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider glitch-text">
                PIKO COMMAND
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
                100% Free · Browser-Intent Distribution
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
                      onClick={generateCaptions}
                      disabled={isGenerating || !caption.trim()}
                      variant="outline"
                      className="border-2 border-emerald-600/70 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all font-black uppercase tracking-wide active:scale-95"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          REMIXING...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          REMIX AI
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handlePostSubmit}
                      disabled={!caption.trim() || platforms.length === 0 || isPosting}
                      className="bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-widest text-lg border-2 border-lime-400 shadow-2xl shadow-lime-400/40 active:scale-95 transition-all h-12"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                          LAUNCHING...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-2" />
                          DROP IT
                        </>
                      )}
                    </Button>
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

              {showCaptionDialog && generatedCaptions && (
                <Card className="bento-item-ai border-2 border-lime-500/50 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-lime-500/20">
                  <CardHeader className="border-b border-zinc-800/50">
                    <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-lime-400" />
                      <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                        REMIX RESULTS
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="hype" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border-2 border-zinc-800">
                        <TabsTrigger value="hype" className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
                          HYPE
                        </TabsTrigger>
                        <TabsTrigger value="promo" className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
                          PROMO
                        </TabsTrigger>
                        <TabsTrigger value="viral" className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
                          VIRAL
                        </TabsTrigger>
                      </TabsList>

                      {(['hype', 'promo', 'viral'] as const).map(variant => (
                        <TabsContent key={variant} value={variant} className="mt-4 space-y-3">
                          <div className="p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30">
                            <p className="text-sm leading-relaxed">{generatedCaptions[variant]}</p>
                          </div>
                          <Button
                            onClick={() => selectCaption(variant)}
                            className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider active:scale-95 transition-all"
                          >
                            USE THIS CAPTION
                          </Button>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
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

          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                    <TrendingUp className="w-7 h-7 text-lime-400" />
                    <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                      POST HISTORY
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!postHistory || postHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
                      <p className="text-zinc-500 font-bold uppercase tracking-wide">No posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {postHistory.map(post => (
                        <div
                          key={post.id}
                          className="p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30 hover:border-lime-500/50 transition-all space-y-3"
                        >
                          <p className="text-sm leading-relaxed line-clamp-4">{post.caption}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.platforms.map(platform => (
                              <Badge key={platform} className="bg-lime-500/10 text-lime-400 border border-lime-500/30 font-bold uppercase text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-zinc-500 font-medium">
                            {new Date(post.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
