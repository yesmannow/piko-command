import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Music, ExternalLink, Calendar, Loader2, RefreshCw, AlertCircle, Flame, Share2, MessageCircle, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { fetchTracksJSON, type TrackData } from '@/lib/githubAPI'

interface VaultCredentials {
  githubToken: string
  githubRepo: string
  githubOwner: string
}

export function ReleasesView() {
  const [credentials] = useKV<VaultCredentials>('vault-credentials', {
    githubToken: '',
    githubRepo: '',
    githubOwner: ''
  })
  
  const [tracks, setTracks] = useState<TrackData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)

  const fetchTracks = async () => {
    if (!credentials?.githubToken || !credentials?.githubRepo || !credentials?.githubOwner) {
      setError('GitHub credentials not configured')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const tracksData = await fetchTracksJSON({
        githubToken: credentials.githubToken,
        githubRepo: credentials.githubRepo,
        githubOwner: credentials.githubOwner,
      })
      
      setTracks(tracksData)
      toast.success(`Loaded ${tracksData.length} track(s) from GitHub`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tracks'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (credentials?.githubToken && credentials?.githubRepo && credentials?.githubOwner) {
      fetchTracks()
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card className="studio-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
              <Music className="w-6 h-6 text-primary" />
              RELEASES CATALOG
            </CardTitle>
            <Button
              onClick={fetchTracks}
              variant="outline"
              size="sm"
              disabled={isLoading || !credentials?.githubToken}
              className="hover:border-primary/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!credentials?.githubToken && (
            <Alert className="border-accent bg-accent/10">
              <AlertCircle className="w-5 h-5 text-accent" />
              <AlertDescription className="text-accent font-bold">
                Configure GitHub credentials in the Vault tab to view releases
              </AlertDescription>
            </Alert>
          )}

          {error && credentials?.githubToken && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <AlertDescription className="text-destructive font-bold">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Loading releases...</p>
            </div>
          )}

          {!isLoading && !error && tracks.length === 0 && credentials?.githubToken && (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base font-bold uppercase mb-2">No releases found</p>
              <p className="text-sm">Upload tracks in the Studio tab to see them here</p>
            </div>
          )}

          {!isLoading && tracks.length > 0 && (
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map((track) => (
                  <Card 
                    key={track.id} 
                    className="studio-card hover:border-primary/50 transition-all group relative overflow-hidden"
                    onMouseEnter={() => setHoveredTrack(track.id)}
                    onMouseLeave={() => setHoveredTrack(null)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {track.r2.coverImageUrl ? (
                        <div className="aspect-square rounded overflow-hidden bg-muted border border-border relative">
                          <img 
                            src={track.r2.coverImageUrl} 
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {hoveredTrack === track.id && track.stats && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-center space-y-3 animate-in fade-in duration-200">
                              <h4 className="text-xs font-black uppercase text-accent mb-2 flex items-center gap-2">
                                <Flame className="w-4 h-4" />
                                Hype Meters
                              </h4>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1">
                                    <Share2 className="w-3 h-3 text-secondary" />
                                    <span className="font-bold">Shares</span>
                                  </div>
                                  <span className="font-black">{track.stats.shares}</span>
                                </div>
                                <Progress value={(track.stats.shares / 1000) * 100} className="h-1.5 neon-glow-cyan" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-accent" />
                                    <span className="font-bold">Fire 🔥</span>
                                  </div>
                                  <span className="font-black">{track.stats.fireEmojis}</span>
                                </div>
                                <Progress value={(track.stats.fireEmojis / 3000) * 100} className="h-1.5 neon-glow-orange" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3 text-primary" />
                                    <span className="font-bold">Comments</span>
                                  </div>
                                  <span className="font-black">{track.stats.comments}</span>
                                </div>
                                <Progress value={(track.stats.comments / 1000) * 100} className="h-1.5 neon-glow-magenta" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-secondary" />
                                    <span className="font-bold">Engagement</span>
                                  </div>
                                  <span className="font-black">{track.stats.engagementRate}</span>
                                </div>
                                <Progress value={parseInt(track.stats.engagementRate)} className="h-1.5 neon-glow-cyan" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square rounded overflow-hidden bg-muted border border-border flex items-center justify-center">
                          <Music className="w-16 h-16 text-muted-foreground opacity-50" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <h3 className="font-black text-lg leading-tight line-clamp-1">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>

                      {track.releaseDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(track.releaseDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {track.r2.audioUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => window.open(track.r2.audioUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Audio
                          </Button>
                        )}
                        {track.r2.coverImageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => window.open(track.r2.coverImageUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Cover
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {track.status === 'live' ? '🟢 Live' : track.status === 'scheduled' ? '🟡 Scheduled' : '⚪ Draft'}
                        </Badge>
                        {track.stats && (
                          <span className="text-xs text-muted-foreground">
                            Hover for stats
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {credentials?.githubToken && (
        <Card className="studio-card">
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-tight flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-secondary" />
              LIVE WEBSITE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-secondary/50 hover:bg-secondary/10 hover:border-secondary transition-all"
              onClick={() => window.open('https://piko-artist-website.vercel.app/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open piko-artist-website.vercel.app
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
