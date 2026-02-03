import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon, 
  Clock,
  ExternalLink,
  Copy,
  Hash
} from 'lucide-react'
import { 
  InstagramLogo, 
  TiktokLogo, 
  XLogo, 
  FacebookLogo, 
  LinkedinLogo 
} from '@phosphor-icons/react'

interface PostHistory {
  id: string
  caption: string
  platforms: string[]
  timestamp: number
  linkInBio: boolean
}

interface TimelineCalendarProps {
  posts: PostHistory[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const platformIcons: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  instagram: { icon: InstagramLogo, color: 'text-pink-400' },
  tiktok: { icon: TiktokLogo, color: 'text-cyan-400' },
  twitter: { icon: XLogo, color: 'text-blue-400' },
  facebook: { icon: FacebookLogo, color: 'text-blue-500' },
  linkedin: { icon: LinkedinLogo, color: 'text-blue-600' }
}

export function TimelineCalendar({ posts }: TimelineCalendarProps) {
  const groupedByDate = posts.reduce((acc, post) => {
    const date = new Date(post.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(post)
    return acc
  }, {} as Record<string, PostHistory[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
        <p className="text-zinc-500 font-bold uppercase tracking-wide">No posts in timeline</p>
        <p className="text-sm text-zinc-600 mt-2">Your distribution history will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(date => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-3 sticky top-0 bg-zinc-950/95 backdrop-blur-xl py-3 z-10 border-b border-zinc-800/50">
            <CalendarIcon className="w-5 h-5 text-lime-400" />
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300">
              {date}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            <Badge className="bg-zinc-800 text-zinc-400 border-0 font-bold">
              {groupedByDate[date].length} {groupedByDate[date].length === 1 ? 'Post' : 'Posts'}
            </Badge>
          </div>

          <div className="space-y-3 pl-0 md:pl-8">
            {groupedByDate[date].map((post) => {
              const time = new Date(post.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <Card 
                  key={post.id}
                  className="border-2 border-zinc-800 bg-zinc-950/60 backdrop-blur-sm hover:border-lime-500/50 hover:bg-zinc-900/60 transition-all group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lime-400 via-emerald-400 to-lime-400" />
                  
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                        <div className="h-4 w-px bg-zinc-700" />
                        <Badge className="bg-zinc-800/80 text-lime-400 border border-lime-500/30 font-mono text-xs">
                          #{posts.indexOf(post) + 1}
                        </Badge>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(post.caption)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded"
                        title="Copy caption"
                      >
                        <Copy className="w-4 h-4 text-zinc-400 hover:text-lime-400 transition-colors" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed text-zinc-200 line-clamp-3 font-medium">
                        {post.caption}
                      </p>
                      
                      {post.caption.length > 200 && (
                        <button 
                          onClick={() => {
                            const element = document.getElementById(`post-${post.id}`)
                            if (element) {
                              element.classList.toggle('line-clamp-3')
                            }
                          }}
                          className="text-xs text-lime-400 hover:text-lime-300 font-bold uppercase tracking-wide"
                        >
                          Read More
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-zinc-800/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.platforms.map(platform => {
                          const config = platformIcons[platform]
                          if (!config) return null
                          const Icon = config.icon
                          
                          return (
                            <div
                              key={platform}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/50 border border-zinc-800 hover:border-lime-500/30 transition-all"
                            >
                              <Icon className={`w-4 h-4 ${config.color}`} weight="bold" />
                              <span className="text-xs font-bold text-zinc-400 uppercase">
                                {platform}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {post.linkInBio && (
                        <Badge className="bg-lime-500/10 text-lime-400 border border-lime-500/30 text-xs font-bold flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Link in Bio
                        </Badge>
                      )}
                    </div>

                    {post.caption.match(/#[\w]+/g) && (
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <Hash className="w-3.5 h-3.5 text-zinc-600" />
                        {post.caption.match(/#[\w]+/g)?.slice(0, 5).map((tag, i) => (
                          <Badge 
                            key={i} 
                            className="bg-zinc-900/50 text-zinc-500 border border-zinc-800 font-mono text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
