import { useState } from 'react'
import { Card, CardContent, CardDescription
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/co
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
  CheckCircle, 
  Eye, 
  Save,
  Video,
  Zap,
  Info

  twitter?
  Save,
  Hash,
  Video,
  Image as ImageIcon,
  Zap,
  Shield,
  Info
} from 'lucide-react'

interface SocialCredentials {
  twitter?: {
    apiKey: string
    apiSecret: string
    accessToken: string
    accessTokenSecret: string
    connected: boolean
  }
  instagram?: {
    accessToken: string
    userId: string
    connected: boolean
  }
  tiktok?: {
    accessToken: string
    refreshToken: string
    connected: boolean
  }
}

interface PlatformStatus {
  id: 'twitter' | 'instagram' | 'tiktok'
  name: string
  icon: typeof Hash
  color: string
  glowClass: string
  connected: boolean
  description: string
  fields: {
    label: string
    key: string
    placeholder: string
    type?: 'text' | 'password'
  }[]
}

export function SocialConnectHub() {
  const [credentials, setCredentials] = useKV<SocialCredentials>('social-credentials', {})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
        { label: 'API Key', key: 'apiKey', placeholder:

      ]
    {
      name: 'Instagr
      color: 'text-pink-40
      connected: 
      fields: [
        { label: 'User ID', key: '
    },
      id: 'tiktok',
      icon: Vid
      glowClass: 'neon-glow-cyan',
      description: 'Upload videos via TikTok Content Posting API',
        { label: 'Access Token', key: 'accessToken', placeholder: 'Enter your TikTok Access Token', type: 'passw
      ]
  ]
  cons
  }
  const updatePlatform
      const current = pr
        ...current,
          ...(current[platfor
          connected: false
      }
  }
  const testCon
    
      toast.error('Enter credentials first')
    }
    co

      const value =
    })
    if (missingFie
      return



      const cur
        ...current,
          ...(current[platformId] || {}),
       
    }
   

    setCredentials(prev => {
      return {
   

      }
    toast.success('Platform 

    setCredent
  }
  const connectedCount 
  return (
      <Alert className="b
        <AlertDescription 
         
       
      
   


        <CardHeader className="border-b border-zinc
    
                <Link2 cl
                  SOCIAL INTEGRATIONS
            
     

              className={`${
                  ? 'bg-l

              {connectedCount} / {platforms.length} CONNECT
          </div>
        <CardContent className="p-6">
      

                  key={platform.id}
                    platform.connected
            
     

                      <Icon className={`w-6 h-6 ${platfo

                            <div className="w-2 h-2 rounded

                          <>
                            <spa
              
                   
                    <p 
                </Card>
            })}

       
      

                    value={platform.id}
   

                )
            </TabsList>
            {platforms.map(platf
              
                <Ta
                    <In
                      <strong className="
                  </Alert>
         
       
      
                    return (
   

                            
                            >
                                <EyeOff classNam
   

                        </Label>

          
                          class
                      </div>
                  })}
                  <div className="flex gap-3 pt-4">
                      <>
                          onClick={
                          className="flex-1 border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 font-black uppercase"
                
                        </Button>
                          onClick={() => tes
                        >
                  
                
                      <Butt
              

                      </Button>
                  </div>
              )
          </Tabs>
      </Card>
      <Button
        className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 text-lg font-black uppercase neon-glow-l
        <Save className="w-5 h-5 mr-2
      </Button>
      <Alert className="bo
        <AlertDescription className="text-xs tex
        </AlertDescription>
    </div>
}






































































































































































