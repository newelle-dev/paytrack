import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <Card className="w-full bg-ivory-light shadow-xl border-gold/20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-gold-dark">Welcome to Arzi</CardTitle>
          <CardDescription className="text-center text-text-secondary">
            Sign in to manage your business dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex-1 flex flex-col w-full justify-center gap-4 text-text-primary">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                name="email"
                placeholder="you@example.com"
                required
                className="bg-ivory"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="bg-ivory"
              />
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button formAction={login} variant="default" className="w-full font-medium">
                Sign In
              </Button>
              <Button formAction={signup} variant="outline" className="w-full font-medium text-text-secondary">
                Sign Up
              </Button>
            </div>

            {params?.message && (
              <div className="mt-4 p-3 bg-red-50 border border-error/50 text-error text-center text-sm rounded-md">
                {params.message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
