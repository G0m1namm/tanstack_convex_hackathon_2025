import { Link, createFileRoute } from '@tanstack/react-router'
import { useAction } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Database, Plus, ArrowLeft } from 'lucide-react'

import { api } from '../../convex/_generated/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export const Route = createFileRoute('/anotherPage')({
  component: AnotherPage,
})

function AnotherPage() {
  const callMyAction = useAction(api.myFunctions.myAction)

  const { data } = useSuspenseQuery(
    convexQuery(api.myFunctions.listNumbers, { count: 10 }),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border border-primary/30 mb-4">
            <Database className="w-3 h-3 mr-1" />
            Demo Page
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Convex + TanStack Start
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing database operations with Convex backend
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" strokeWidth={1.5} />
              Database Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Numbers Display */}
            <div className="p-4 bg-secondary border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                Current Numbers
              </p>
              <p className="text-lg text-foreground font-mono">
                {data.numbers.join(', ')}
              </p>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-foreground">
                Click the button below to add a random number to the database.
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => {
                callMyAction({
                  first: Math.round(Math.random() * 100),
                }).then(() => alert('Number added!'))
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              Add Random Number
            </Button>

            {/* Back Link */}
            <div className="pt-4 border-t border-border">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
