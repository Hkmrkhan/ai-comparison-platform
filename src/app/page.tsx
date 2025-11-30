import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Model Comparison Platform
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Compare multiple AI models side by side with one prompt
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}