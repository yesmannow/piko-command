import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function SocialMediaAuth() {
  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950/90">
      <CardHeader>
        <CardTitle className="text-xl uppercase tracking-wider font-black">
          SOCIAL MEDIA AUTH
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="border-2 border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <AlertDescription className="text-yellow-400 font-bold">
            This authentication component has been deprecated. OAuth features are not implemented.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
