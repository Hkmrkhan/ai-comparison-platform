import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Comparison</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        <LoginForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
           {' '}
            <Link href="/signup" className="text-primary hover:underline">
              
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}