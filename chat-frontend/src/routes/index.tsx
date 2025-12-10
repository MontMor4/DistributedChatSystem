import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from '@/lib/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()
  const data = session.data
  
  if (data?.token) {
    throw redirect({
      to: '/chat',
    })
  }
})

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    await checkAuth()
  },
})

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Distributed Chat</CardTitle>
          <CardDescription>
            Connect with your friends and colleagues in a distributed environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
