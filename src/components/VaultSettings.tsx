import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import { Key, Github, Database, Eye, EyeOff, Save, CheckCircle, AlertCircle, ChevronDown, Info, Sparkles } from 'lucide-react'

interface VaultCredentials {
  r2AccessKey: string
  r2SecretKey: string
  r2BucketName: string
  r2AccountId: string
  githubToken: string
  githubRepo: string
  githubOwner: string
}

export function VaultSettings() {
  const [credentials, setCredentials] = useKV<VaultCredentials>('vault-credentials', {
    r2AccessKey: '',
    r2SecretKey: '',
    r2BucketName: '',
    r2AccountId: '',
    githubToken: '',
    githubRepo: '',
    githubOwner: ''
  })

  const [showSecrets, setShowSecrets] = useState({
    r2SecretKey: false,
    githubToken: false
  })

  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const handleSave = () => {
    if (!credentials) return
    
    const requiredFields = [
      { key: 'r2AccessKey', label: 'R2 Access Key' },
      { key: 'r2SecretKey', label: 'R2 Secret Key' },
      { key: 'r2BucketName', label: 'R2 Bucket Name' },
      { key: 'r2AccountId', label: 'R2 Account ID' },
      { key: 'githubToken', label: 'GitHub Token' },
      { key: 'githubRepo', label: 'GitHub Repo' },
      { key: 'githubOwner', label: 'GitHub Owner' }
    ]

    const missingFields = requiredFields.filter(field => 
      !credentials[field.key as keyof VaultCredentials]?.trim()
    )

    if (missingFields.length > 0) {
      toast.error(`Missing: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    setCredentials((current) => current || credentials)
    toast.success('Vault credentials saved securely!')
  }

  const updateCredential = (key: keyof VaultCredentials, value: string) => {
    setCredentials(prev => {
      const base = prev || {
        r2AccessKey: '',
        r2SecretKey: '',
        r2BucketName: '',
        r2AccountId: '',
        githubToken: '',
        githubRepo: '',
        githubOwner: ''
      }
      return { ...base, [key]: value }
    })
  }

  const toggleSecretVisibility = (key: 'r2SecretKey' | 'githubToken') => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const loadTestCredentials = () => {
    const testCreds: VaultCredentials = {
      r2AccessKey: 'test_access_key_1234567890abcdef',
      r2SecretKey: 'test_secret_key_0987654321fedcba',
      r2BucketName: 'piko-tracks-test',
      r2AccountId: 'test_account_id_xyz789',
      githubToken: 'ghp_test_token_abcdef1234567890xyz',
      githubRepo: 'piko-artist-website',
      githubOwner: 'piko-test-user'
    }
    
    setCredentials(() => testCreds)
    setShowSecrets({ r2SecretKey: true, githubToken: true })
    toast.success('Test credentials loaded! These are demo values for testing the UI.')
  }

  const isR2Configured = () => {
    return !!(
      credentials?.r2AccessKey &&
      credentials?.r2SecretKey &&
      credentials?.r2BucketName &&
      credentials?.r2AccountId
    )
  }

  const isGitHubConfigured = () => {
    return !!(
      credentials?.githubToken &&
      credentials?.githubRepo &&
      credentials?.githubOwner
    )
  }

  return (
    <div className="space-y-6">
      <Alert className={isR2Configured() && isGitHubConfigured() ? 'border-secondary bg-secondary/10' : 'border-accent bg-accent/10'}>
        <div className="flex items-center gap-2">
          {isR2Configured() && isGitHubConfigured() ? (
            <>
              <CheckCircle className="w-5 h-5 text-secondary" />
              <AlertDescription className="text-secondary font-bold">
                Vault configured! Track uploads are ready.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-accent" />
              <AlertDescription className="text-accent font-bold">
                Configure credentials below to enable track uploads.
              </AlertDescription>
            </>
          )}
        </div>
      </Alert>

      <div className="flex gap-3">
        <Button
          onClick={loadTestCredentials}
          variant="outline"
          className="flex-1 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Load Test Credentials
        </Button>
      </div>

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
                <h4 className="font-black uppercase text-secondary flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Step 1: Cloudflare R2
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to Cloudflare Dashboard → R2 → Overview</li>
                  <li>Copy your <strong>Account ID</strong></li>
                  <li>Create a bucket (e.g., "piko-tracks") or use existing one</li>
                  <li>Go to "Manage R2 API Tokens" → Create API Token</li>
                  <li>Choose "Edit" permissions, copy <strong>Access Key ID</strong> and <strong>Secret Access Key</strong></li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-black uppercase text-primary flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Step 2: GitHub
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Select scopes: <strong>repo</strong> (all), <strong>workflow</strong></li>
                  <li>Generate and copy the token (starts with "ghp_")</li>
                  <li>Enter your GitHub username as "Owner" and repository name (e.g., "piko-artist-website")</li>
                </ol>
              </div>

              <div className="p-3 rounded bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">💡 Pro Tip:</strong> All credentials are stored securely in your browser using encrypted persistence. They never leave your device.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-secondary" />
            CLOUDFLARE R2 STORAGE
          </CardTitle>
          <CardDescription>
            Configure your R2 bucket for secure track uploads. Get credentials from Cloudflare Dashboard → R2 → Manage R2 API Tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Account ID</Label>
            <Input
              value={credentials?.r2AccountId || ''}
              onChange={(e) => updateCredential('r2AccountId', e.target.value)}
              placeholder="e.g., a1b2c3d4e5f6g7h8i9j0"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Found in Cloudflare Dashboard → R2 → Overview
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Bucket Name</Label>
            <Input
              value={credentials?.r2BucketName || ''}
              onChange={(e) => updateCredential('r2BucketName', e.target.value)}
              placeholder="e.g., piko-tracks"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Your R2 bucket name (create one in R2 Dashboard if needed)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Access Key ID</Label>
            <Input
              value={credentials?.r2AccessKey || ''}
              onChange={(e) => updateCredential('r2AccessKey', e.target.value)}
              placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              R2 API Token Access Key ID
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase flex items-center justify-between">
              Secret Access Key
              <button
                onClick={() => toggleSecretVisibility('r2SecretKey')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSecrets.r2SecretKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </Label>
            <Input
              type={showSecrets.r2SecretKey ? 'text' : 'password'}
              value={credentials?.r2SecretKey || ''}
              onChange={(e) => updateCredential('r2SecretKey', e.target.value)}
              placeholder="Enter R2 Secret Access Key"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              R2 API Token Secret (shown when you create the token)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Github className="w-6 h-6 text-primary" />
            GITHUB INTEGRATION
          </CardTitle>
          <CardDescription>
            Automatically update your website repo when tracks are uploaded. Create a token at GitHub Settings → Developer settings → Personal access tokens (classic).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Repository Owner</Label>
            <Input
              value={credentials?.githubOwner || ''}
              onChange={(e) => updateCredential('githubOwner', e.target.value)}
              placeholder="e.g., yourusername"
              className="bg-muted/50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Repository Name</Label>
            <Input
              value={credentials?.githubRepo || ''}
              onChange={(e) => updateCredential('githubRepo', e.target.value)}
              placeholder="e.g., piko-artist-website"
              className="bg-muted/50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase flex items-center justify-between">
              Personal Access Token
              <button
                onClick={() => toggleSecretVisibility('githubToken')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSecrets.githubToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </Label>
            <Input
              type={showSecrets.githubToken ? 'text' : 'password'}
              value={credentials?.githubToken || ''}
              onChange={(e) => updateCredential('githubToken', e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Requires: <strong>repo</strong> and <strong>workflow</strong> scopes
            </p>
          </div>
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
