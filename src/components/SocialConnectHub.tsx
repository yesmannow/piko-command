import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function SocialConnectHub() {
  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950/90">
      <CardHeader>
        <CardTitle className="text-xl uppercase tracking-wider font-black">
          SOCIAL INTEGRATIONS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="border-2 border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <AlertDescription className="text-yellow-400 font-bold">
            OAuth integration features have been deprecated. The app currently uses browser intents and clipboard copying for social media posting.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
