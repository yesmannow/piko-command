import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Key, Github, Database, Eye, EyeOff, Save } from 'lucide-react'

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

    setCredentials(credentials)
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

  return (
    <div className="space-y-6">
      <Card className="studio-card">
        <CardHeader>
          <CardTitle className="text-2xl uppercase tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-secondary" />
            CLOUDFLARE R2 STORAGE
          </CardTitle>
          <CardDescription>
            Configure your R2 bucket for secure track uploads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Account ID</Label>
            <Input
              value={credentials?.r2AccountId || ''}
              onChange={(e) => updateCredential('r2AccountId', e.target.value)}
              placeholder="Enter R2 Account ID"
              className="bg-muted/50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Bucket Name</Label>
            <Input
              value={credentials?.r2BucketName || ''}
              onChange={(e) => updateCredential('r2BucketName', e.target.value)}
              placeholder="Enter bucket name"
              className="bg-muted/50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-black uppercase">Access Key ID</Label>
            <Input
              value={credentials?.r2AccessKey || ''}
              onChange={(e) => updateCredential('r2AccessKey', e.target.value)}
              placeholder="Enter R2 Access Key"
              className="bg-muted/50 font-mono"
            />
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
              placeholder="Enter R2 Secret Key"
              className="bg-muted/50 font-mono"
            />
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
            Automatically update your website repo when tracks are uploaded
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
              placeholder="ghp_xxxxxxxxxxxx"
              className="bg-muted/50 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Requires: repo, workflow permissions
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
