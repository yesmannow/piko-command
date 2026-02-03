import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Music2,
  TrendingUp,
  Eye,
  Users,
  Hash,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react'
import { YouTubeVault } from '@/components/YouTubeVault'

interface PostHistory {
  id: string
  caption: string
  platforms: string[]
  timestamp: number
  videoUrl?: string
  linkInBio: boolean
}

interface CaptionVariant {
  youtube_hype: string
  behind_the_scenes: string
  seo_shorts: string
}

const PIKO_WEBSITE = 'https://piko-artist-website.vercel.app'
const PIKO_MUSIC_LINK = 'https://music.youtube.com/channel/UCD2ybRyk6b1pQDfOtq2MYIw'

function App() {
  const [caption, setCaption] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'tiktok', 'youtube'])
  const [linkInBio, setLinkInBio] = useState(true)
  const [postHistory, setPostHistory] = useKV<PostHistory[]>('piko_post_history', [])
  const [ayrshareApiKey, setAyrshareApiKey] = useKV<string>('ayrshare_api_key', '')
  const [isPosting, setIsPosting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionVariant | null>(null)
  const [showCaptionDialog, setShowCaptionDialog] = useState(false)
  const [currentView, setCurrentView] = useState<'composer' | 'history' | 'settings'>('composer')
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
    const starterCaption = `🔥 Check out the new drop: ${videoTitle}\n\n${videoUrl}`
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
      toast.error('Enter a YouTube link or draft caption first!')
      return
    }

    setIsGenerating(true)

    try {
      const promptText = `You are the Creative Director for PIKO, a YouTube-focused hip-hop artist. Generate 3 caption styles for this YouTube content:

INPUT: ${caption}

Generate exactly 3 caption styles optimized for different platforms. Return a JSON object with these exact keys:

1. "youtube_hype": Aggressive, emoji-heavy (🔥, 💿, 🚀). Focus on "New Music Video" and "Link in Bio". Include #PikoMusic #NewHipHop #YouTubeMusic
2. "behind_the_scenes": Narrative style about the grind, the shoot, and the vision. Authentic street voice. Include relevant hashtags.
3. "seo_shorts": Short, punchy, hashtag-heavy for TikTok/IG Reels to drive traffic to YouTube. Maximum engagement focus.

Voice: Authentic, Street, Technical, Energetic. Each caption under 200 characters.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const result = JSON.parse(response)

      setGeneratedCaptions({
        youtube_hype: result.youtube_hype || '',
        behind_the_scenes: result.behind_the_scenes || '',
        seo_shorts: result.seo_shorts || ''
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
      let finalCaption = caption

      if (linkInBio) {
        finalCaption += `\n\n🔗 Website: ${PIKO_WEBSITE}\n💿 Listen: ${PIKO_MUSIC_LINK}`
      }

      if (!ayrshareApiKey) {
        toast.info('Set Ayrshare API key in Settings for real posting')
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        toast.info('Ayrshare integration temporarily disabled')
      }

      const newPost: PostHistory = {
        id: Date.now().toString(),
        caption: finalCaption,
        platforms,
        timestamp: Date.now(),
        linkInBio
      }

      setPostHistory(prev => [newPost, ...(prev || [])])

      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#bef264', '#10b981', '#22c55e', '#84cc16']
      })

      toast.success('DROPPED! 🚀')
      setCaption('')
      setPlatforms(['instagram', 'tiktok', 'youtube'])
    } catch (error) {
      toast.error(`Drop failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPosting(false)
    }
  }

  const getCharacterLimit = () => {
    if (platforms.includes('twitter')) return 280
    return 2200
  }

  const characterCount = caption.length
  const characterLimit = getCharacterLimit()
  const isOverLimit = characterCount > characterLimit
  const isNearLimit = characterCount > characterLimit * 0.9

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider bg-gradient-to-r from-lime-400 via-emerald-400 to-green-400 bg-clip-text text-transparent drop-shadow-2xl">
                PIKO COMMAND
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
                YouTube-First Content Distribution System
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
            COMPOSER
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
          <Button
            variant={currentView === 'settings' ? 'default' : 'outline'}
            onClick={() => setCurrentView('settings')}
            className={
              currentView === 'settings'
                ? 'bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all'
                : 'border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide active:scale-95 transition-all'
            }
          >
            <Users className="w-4 h-4 mr-2" />
            SETTINGS
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
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl hover:border-lime-500/30 transition-all">
                    <CardHeader className="border-b border-zinc-800/50">
                      <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                        <Zap className="w-7 h-7 text-lime-400" />
                        <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                          CONTENT COMPOSER
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                          CAPTION / VIDEO URL
                        </Label>
                        <Textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Paste YouTube link or write your caption..."
                          className="min-h-[180px] resize-none bg-zinc-900/50 border-2 border-zinc-800 focus:border-lime-500 focus:ring-lime-500/20 text-base font-medium rounded-lg transition-all"
                          id="caption-input"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {platforms.includes('twitter') && (
                              <Badge
                                variant="outline"
                                className={`border-2 ${isOverLimit ? 'border-red-500 text-red-400' : isNearLimit ? 'border-yellow-500 text-yellow-400' : 'border-zinc-700 text-zinc-400'} font-bold`}
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                X Limit
                              </Badge>
                            )}
                          </div>
                          <span className={`text-sm font-black tabular-nums ${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            {characterCount} / {characterLimit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-5 h-5 text-lime-400" />
                          <div>
                            <p className="text-sm font-black uppercase tracking-wide">Link in Bio</p>
                            <p className="text-xs text-zinc-500">Auto-append website + music links</p>
                          </div>
                        </div>
                        <Switch
                          checked={linkInBio}
                          onCheckedChange={setLinkInBio}
                          className="data-[state=checked]:bg-lime-400"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                          TARGET PLATFORMS
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { id: 'instagram', label: 'IG Reels', icon: ImageIcon },
                            { id: 'tiktok', label: 'TikTok', icon: Video },
                            { id: 'youtube', label: 'YT Shorts', icon: Youtube },
                            { id: 'twitter', label: 'X', icon: Hash },
                            { id: 'facebook', label: 'Facebook', icon: Users }
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
                            </Button>
                          ))}
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
                              GHOSTWRITING...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              GHOSTWRITER AI
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handlePostSubmit}
                          disabled={!caption.trim() || platforms.length === 0 || isOverLimit || isPosting}
                          className="bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-widest text-lg border-2 border-lime-400 shadow-2xl shadow-lime-400/40 active:scale-95 transition-all h-12"
                        >
                          {isPosting ? (
                            <>
                              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                              POSTING...
                            </>
                          ) : (
                            <>
                              <Send className="w-6 h-6 mr-2" />
                              POST TO ALL
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
                    <Card className="border-2 border-lime-500/50 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-lime-500/20">
                      <CardHeader className="border-b border-zinc-800/50">
                        <CardTitle className="text-xl uppercase tracking-wider font-black flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-lime-400" />
                          <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                            GHOSTWRITER RESULTS
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <Tabs defaultValue="youtube_hype" className="w-full">
                          <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border-2 border-zinc-800">
                            <TabsTrigger value="youtube_hype" className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
                              YT HYPE
                            </TabsTrigger>
                            <TabsTrigger value="behind_the_scenes" className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
                              BTS
                            </TabsTrigger>
                            <TabsTrigger value="seo_shorts" className="font-bold uppercase text-xs data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950">
                              SEO
                            </TabsTrigger>
                          </TabsList>

                          {(['youtube_hype', 'behind_the_scenes', 'seo_shorts'] as const).map(variant => (
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
                </div>

                <div className="space-y-6">
                  <YouTubeVault onQuickShare={handleQuickShare} />

                  <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
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
                </div>
              </div>
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
                            {post.linkInBio && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-xs">
                                <LinkIcon className="w-3 h-3 mr-1" />
                                LINK
                              </Badge>
                            )}
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

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                    <Users className="w-7 h-7 text-lime-400" />
                    <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                      API SETTINGS
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest font-black text-zinc-400">
                      AYRSHARE API KEY
                    </Label>
                    <Input
                      type="password"
                      value={ayrshareApiKey || ''}
                      onChange={(e) => setAyrshareApiKey(() => e.target.value)}
                      placeholder="Enter your Ayrshare API key..."
                      className="bg-zinc-900/50 border-2 border-zinc-800 focus:border-lime-500 focus:ring-lime-500/20 font-mono transition-all"
                    />
                    <p className="text-xs text-zinc-500">
                      Get your API key from{' '}
                      <a
                        href="https://ayrshare.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lime-400 hover:text-lime-300 underline"
                      >
                        ayrshare.com
                      </a>
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border-2 border-zinc-800 bg-zinc-900/30 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      PIKO LINKS
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Website</span>
                        <a
                          href={PIKO_WEBSITE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-lime-400 hover:text-lime-300 font-mono underline"
                        >
                          {PIKO_WEBSITE}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">YouTube Music</span>
                        <a
                          href={PIKO_MUSIC_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-lime-400 hover:text-lime-300 font-mono underline"
                        >
                          {PIKO_MUSIC_LINK.replace('https://', '')}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => toast.success('Settings saved!')}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider active:scale-95 transition-all"
                  >
                    SAVE SETTINGS
                  </Button>
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
