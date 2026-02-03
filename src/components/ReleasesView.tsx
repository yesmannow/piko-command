import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Music, AlertCircle } from 'lucide-react'

export function ReleasesView() {
  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-zinc-800/50">
        <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
          <Music className="w-7 h-7 text-lime-400" />
          <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            RELEASES
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Alert className="border-2 border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <AlertDescription className="text-yellow-400 font-bold">
            This view is being migrated to the new GitHub-native system.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
