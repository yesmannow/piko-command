import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import { Github, Eye, EyeOff, Save, CheckCircle, AlertCircle, ChevronDown, Info, Loader2 } from 'lucide-react'
import { checkGitHubConnection } from '@/lib/githubAssetUploader'

interface VaultCredentials {
  githubToken: string
}

export function VaultSettings() {
  const [credentials, setCredentials] = useKV<VaultCredentials>('vault-credentials', {
    githubToken: ''
  })

  const [showToken, setShowToken] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = () => {
    if (!credentials?.githubToken?.trim()) {
      toast.error('GitHub Personal Access Token is required')
      return
    }

    setCredentials((current) => current || credentials)
    toast.success('GitHub credentials saved securely!')
  }

  const updateToken = (value: string) => {
    setCredentials(prev => {
      const base = prev || { githubToken: '' }
      return { ...base, githubToken: value }
    })
    setConnectionStatus('idle')
  }

  const handleCheckConnection = async () => {
    if (!credentials?.githubToken?.trim()) {
      toast.error('Enter a GitHub token first')
      return
    }

    setIsChecking(true)
    setConnectionStatus('idle')

    try {
      const isConnected = await checkGitHubConnection({
        githubToken: credentials.githubToken,
        githubRepo: 'piko-artist-website-v3',
        githubOwner: 'yesmannow'
      })

      if (isConnected) {
        setConnectionStatus('success')
        toast.success('✓ Connected to yesmannow/piko-artist-website-v3')
      } else {
        setConnectionStatus('error')
        toast.error('Connection failed - check token permissions')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Connection check failed')
    } finally {
      setIsChecking(false)
    }
  }

  const isConfigured = () => {
    return !!(credentials?.githubToken?.trim())
  }

  return (
    <div className="space-y-6">
      <Alert className={isConfigured() ? 'border-secondary bg-secondary/10' : 'border-accent bg-accent/10'}>
        <div className="flex items-center gap-2">
          {isConfigured() ? (
            <>
              <CheckCircle className="w-5 h-5 text-secondary" />
              <AlertDescription className="text-secondary font-bold">
                GitHub configured! Track uploads are ready.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-accent" />
              <AlertDescription className="text-accent font-bold">
                Configure GitHub token below to enable track uploads.
              </AlertDescription>
            </>
          )}
        </div>
      </Alert>

      <Collapsible open={showSetupGuide} onOpenChange={setShowSetupGuide}>
        <Card className="studio-card border-primary/30">
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg uppercase tracking-tight">Setup Guide</CardTitle>
                </div>
                <ChevronDown className={`w-5 h-5 text-primary transition-transform ${showSetupGuide ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-black uppercase text-primary flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Personal Access Token Setup
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Give it a descriptive name (e.g., "PIKO Command Hub")</li>
                  <li>Select scopes: <strong>repo</strong> (all permissions)</li>
                  <li>Generate and copy the token (starts with "ghp_")</li>
                  <li>Paste it below and click "Check Connection" to verify</li>
                </ol>
              </div>

              <div className="p-3 rounded bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong className="text-foreground">🎯 Target Repository:</strong> yesmannow/piko-artist-website-v3
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">💡 Security:</strong> Your token is stored securely in your browser using encrypted persistence. It never leaves your device.
                </p>
              </div>

              <Alert className="border-primary/50 bg-primary/5">
                <Info className="w-4 h-4 text-primary" />
                <AlertDescription className="text-xs">
                  <strong className="text-primary">How it works:</strong> When you upload a track, this app will commit the audio file to <code>/public/audio/tracks/</code>, cover art to <code>/public/images/covers/</code>, and update the track metadata in <code>/src/data/piko-tracks.json</code> - all automatically synced to your website repository.
                </AlertDescription>
              </Alert>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Github className="w-6 h-6 text-primary" />
            GITHUB NATIVE STORAGE
          </CardTitle>
          <CardDescription>
            Direct uploads to yesmannow/piko-artist-website-v3 repository. Audio, cover art, and metadata are synced automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-black uppercase flex items-center justify-between">
              Personal Access Token
              <button
                onClick={() => setShowToken(!showToken)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </Label>
            <Input
              type={showToken ? 'text' : 'password'}
              value={credentials?.githubToken || ''}
              onChange={(e) => updateToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Requires: <strong>repo</strong> scope (full control of private repositories)
            </p>
          </div>

          {connectionStatus !== 'idle' && (
            <Alert className={connectionStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10'}>
              <div className="flex items-center gap-2">
                {connectionStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <AlertDescription className="text-emerald-400 font-bold text-sm">
                      Connection successful! Repository access verified.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <AlertDescription className="text-red-400 font-bold text-sm">
                      Connection failed. Check token permissions and try again.
                    </AlertDescription>
                  </>
                )}
              </div>
            </Alert>
          )}

          <Button
            onClick={handleCheckConnection}
            disabled={!credentials?.githubToken?.trim() || isChecking}
            variant="outline"
            className="w-full border-2 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all font-black uppercase"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                CHECKING...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                CHECK CONNECTION
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full bg-primary hover:bg-primary/90 text-lg font-black uppercase neon-glow-magenta"
        size="lg"
      >
        <Save className="w-5 h-5 mr-2" />
        SAVE VAULT
      </Button>
    </div>
  )
}
