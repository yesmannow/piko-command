import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Music, ExternalLink, Calendar, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface VaultCredentials {
  githubToken: string
  githubRepo: string
  githubOwner: string
}

interface Track {
  id: string
  title: string
  artist: string
  audioUrl?: string
  coverImageUrl?: string
  releaseDate?: string
  uploadedAt: number
}

export function ReleasesView() {
  const [credentials] = useKV<VaultCredentials>('vault-credentials', {
    githubToken: '',
    githubRepo: '',
    githubOwner: ''
  })
  
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTracksFromGitHub = async () => {
    if (!credentials?.githubToken || !credentials?.githubRepo || !credentials?.githubOwner) {
      setError('GitHub credentials not configured')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const filePath = 'tracks.json'
      const repoUrl = `https://api.github.com/repos/${credentials.githubOwner}/${credentials.githubRepo}/contents/${filePath}`

      const response = await fetch(repoUrl, {
        headers: {
          'Authorization': `Bearer ${credentials.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setTracks([])
          setError('tracks.json not found in repository')
          return
        }
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = atob(data.content)
      const tracksData = JSON.parse(content) as Track[]
      
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
      fetchTracksFromGitHub()
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
              onClick={fetchTracksFromGitHub}
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
                  <Card key={track.id} className="studio-card hover:border-primary/50 transition-all group">
                    <CardContent className="p-4 space-y-3">
                      {track.coverImageUrl ? (
                        <div className="aspect-square rounded overflow-hidden bg-muted border border-border">
                          <img 
                            src={track.coverImageUrl} 
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
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
                        {track.audioUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => window.open(track.audioUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Audio
                          </Button>
                        )}
                        {track.coverImageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => window.open(track.coverImageUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Cover
                          </Button>
                        )}
                      </div>

                      <Badge variant="secondary" className="w-full justify-center text-xs">
                        Synced to Website
                      </Badge>
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
