import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Comparison</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>
        <SignupForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {' '}
            <Link href="/login" className="text-primary hover:underline">
        
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}