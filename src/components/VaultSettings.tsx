import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import { Github, Eye, EyeOff, Save, CheckCircle, AlertCircle, ChevronDown, Info, Loader2, Link2 } from 'lucide-react'
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
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const [isChecking, setIsChecking] = useState(false)

  const updateToken = (value: string) => {
    if (!credentials) {
      setCredentials({ githubToken: value })
      return
    }
    
    toast.success('GitHub credentials saved securely!')

    setCredentials(prev => {
      const base = prev || { githubToken: '' }
      return { ...base, githubToken: value }
    })
  }

  const handleCheckConnection = async () => {
    if (!credentials?.githubToken?.trim()) {
      toast.error('Enter a GitHub token first')
      return
    }

    setIsChecking(true)
    setConnectionStatus('checking')

    try {
      const isConnected = await checkGitHubConnection({
        githubToken: credentials.githubToken,
        githubRepo: 'piko-artist-website-v3',
        githubOwner: 'yesmannow'
      })

      if (isConnected) {
        setConnectionStatus('success')
        toast.success('GitHub connection verified!')
      } else {
        setConnectionStatus('error')
        toast.error('Connection failed - check token and repository')
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
    <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-zinc-800/50">
        <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
          <Github className="w-7 h-7 text-lime-400" />
          <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            THE VAULT
          </span>
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Zero-cost GitHub-native storage for tracks and assets
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger 
              value="github" 
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950 font-black uppercase"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </TabsTrigger>
            <TabsTrigger 
              value="social"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950 font-black uppercase"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-6 mt-6">
            <Alert className={isConfigured() ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}>
              {isConfigured() ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <AlertDescription className="text-emerald-400 font-bold">
                    GitHub configured! Upload tracks directly to your repository.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <AlertDescription className="text-yellow-400 font-bold">
                    Configure GitHub to enable asset uploads
                  </AlertDescription>
                </>
              )}
            </Alert>

            <Collapsible open={showSetupGuide} onOpenChange={setShowSetupGuide}>
              <Card className="border-2 border-zinc-800 bg-zinc-900/50">
                <CardHeader className="pb-3">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-lime-400" />
                        <span className="text-sm font-black uppercase tracking-wider">Setup Guide</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSetupGuide ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-zinc-300">How to create a GitHub Personal Access Token:</p>
                      <ol className="list-decimal list-inside space-y-2 text-zinc-400">
                        <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                        <li>Click "Generate new token (classic)"</li>
                        <li>Select scopes: <strong>repo</strong> (full control of private repositories)</li>
                        <li>Copy the token and paste it below</li>
                      </ol>
                    </div>

                    <Alert className="border-blue-500/50 bg-blue-500/10">
                      <Info className="w-4 h-4 text-blue-400" />
                      <AlertDescription className="text-blue-400 text-xs">
                        <strong className="text-foreground">Target Repository:</strong> yesmannow/piko-artist-website-v3
                        <p className="text-xs text-muted-foreground mt-1">
                          Ensure your token has access to this repository
                        </p>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Card className="border-2 border-zinc-800 bg-zinc-900/30">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wider font-black flex items-center gap-2">
                  <Github className="w-5 h-5 text-lime-400" />
                  GITHUB NATIVE STORAGE
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Assets stored in yesmannow/piko-artist-website-v3
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-black text-zinc-400 flex items-center justify-between">
                    <span>GitHub Personal Access Token</span>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-lime-400 hover:text-lime-500 transition-colors"
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
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
                    className="bg-muted/50 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Token must have <strong>repo</strong> scope for full repository access
                  </p>
                </div>

                {connectionStatus !== 'idle' && (
                  <Alert className={
                    connectionStatus === 'success' 
                      ? 'border-emerald-500/50 bg-emerald-500/10' 
                      : connectionStatus === 'error'
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-blue-500/50 bg-blue-500/10'
                  }>
                    {connectionStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <AlertDescription className="text-emerald-400 text-sm font-bold">
                          Connection successful! Repository access verified.
                        </AlertDescription>
                      </>
                    ) : connectionStatus === 'error' ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <AlertDescription className="text-red-400 text-sm font-bold">
                          Connection failed - verify token and repository access
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        <AlertDescription className="text-blue-400 text-sm font-bold">
                          Checking connection...
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                )}

                <Button
                  onClick={handleCheckConnection}
                  disabled={isChecking || !credentials?.githubToken?.trim()}
                  variant="outline"
                  className="w-full border-2 border-zinc-700 hover:border-lime-500/50 hover:bg-lime-500/10 font-bold uppercase tracking-wide"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      CHECKING...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      TEST CONNECTION
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider h-12"
              disabled={!credentials?.githubToken?.trim()}
            >
              <Save className="w-5 h-5 mr-2" />
              SAVE VAULT CREDENTIALS
            </Button>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Info className="w-5 h-5 text-blue-400" />
              <AlertDescription className="text-blue-400 font-bold">
                Social media integration coming soon
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
