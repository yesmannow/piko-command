import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Youtube, ExternalLink, Share2, Play, Loader2 } from 'lucide-react'

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  url: string
  publishedAt: string
  viewCount?: string
}

interface YouTubeVaultProps {
  onQuickShare: (videoUrl: string, videoTitle: string) => void
}

const PIKO_CHANNEL_ID = 'UCD2ybRyk6b1pQDfOtq2MYIw'
const PIKO_CHANNEL_URL = 'https://www.youtube.com/@PikoFG/videos'
const PIKO_MUSIC_URL = `https://music.youtube.com/channel/${PIKO_CHANNEL_ID}`

export function YouTubeVault({ onQuickShare }: YouTubeVaultProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMockVideos()
  }, [])

  const loadMockVideos = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockVideos: YouTubeVideo[] = [
      {
        id: '1',
        title: 'PIKO - New Heat 🔥 (Official Music Video)',
        thumbnail: 'https://picsum.photos/seed/piko1/480/270',
        url: PIKO_CHANNEL_URL,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: '45.2K'
      },
      {
        id: '2',
        title: 'PIKO - Late Night Vibes (Visualizer)',
        thumbnail: 'https://picsum.photos/seed/piko2/480/270',
        url: PIKO_CHANNEL_URL,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: '32.8K'
      },
      {
        id: '3',
        title: 'PIKO - Behind The Scenes: Studio Session',
        thumbnail: 'https://picsum.photos/seed/piko3/480/270',
        url: PIKO_CHANNEL_URL,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: '18.5K'
      },
      {
        id: '4',
        title: 'PIKO - Street Performance (Live)',
        thumbnail: 'https://picsum.photos/seed/piko4/480/270',
        url: PIKO_CHANNEL_URL,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: '62.1K'
      }
    ]
    
    setVideos(mockVideos)
    setLoading(false)
  }

  const handleQuickShare = (video: YouTubeVideo) => {
    onQuickShare(video.url, video.title)
    toast.success(`"${video.title}" loaded into composer!`)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl hover:border-lime-500/30 transition-all">
      <CardHeader className="border-b border-zinc-800/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
            <Youtube className="w-7 h-7 text-lime-400" />
            <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
              YOUTUBE VAULT
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lime-400 animate-pulse shadow-lg shadow-lime-400/50" />
            <span className="text-xs text-lime-400 font-black uppercase tracking-wider">LIVE</span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(PIKO_CHANNEL_URL, '_blank')}
            className="border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 text-xs font-bold uppercase tracking-wide transition-all active:scale-95"
          >
            <Youtube className="w-4 h-4 mr-1.5" />
            Main Channel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(PIKO_MUSIC_URL, '_blank')}
            className="border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 text-xs font-bold uppercase tracking-wide transition-all active:scale-95"
          >
            <Play className="w-4 h-4 mr-1.5" />
            Music
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          <div className="p-4 space-y-3">
            {loading ? (
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-32 w-full bg-zinc-800/50" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-800/50" />
                  </div>
                ))}
              </>
            ) : (
              videos.map(video => (
                <div
                  key={video.id}
                  className="group relative rounded-lg border border-zinc-800/50 hover:border-lime-500/50 bg-zinc-900/30 backdrop-blur overflow-hidden transition-all hover:shadow-lg hover:shadow-lime-500/10"
                >
                  <div className="relative aspect-video bg-zinc-900">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {video.viewCount && (
                        <Badge className="bg-black/70 border-none text-xs font-bold backdrop-blur">
                          👁️ {video.viewCount}
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => window.open(video.url, '_blank')}
                      size="icon"
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-lime-400 hover:bg-lime-500 text-zinc-950 opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-lime-400/50 active:scale-95"
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </Button>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-bold line-clamp-2 leading-tight">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-medium">
                        {formatTimeAgo(video.publishedAt)}
                      </span>
                      <Button
                        onClick={() => handleQuickShare(video)}
                        size="sm"
                        className="bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wide h-8 px-3 shadow-lg shadow-lime-400/20 active:scale-95 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        Quick Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
