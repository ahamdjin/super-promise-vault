import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className='flex min-h-screen items-center justify-center px-6 py-16'>
      <div className='bg-card w-full max-w-md rounded-3xl border p-8 text-center shadow-sm'>
        <p className='text-muted-foreground text-sm font-semibold uppercase tracking-[0.18em]'>
          Auth error
        </p>
        <h1 className='mt-3 text-3xl font-semibold tracking-tight'>We could not complete sign-in.</h1>
        <p className='text-muted-foreground mt-3 text-sm leading-6'>
          The login or confirmation link expired, was incomplete, or returned with an invalid code.
        </p>
        <div className='mt-6 flex justify-center gap-3'>
          <Link
            href='/auth/sign-in'
            className='bg-primary text-primary-foreground inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold'
          >
            Back to sign in
          </Link>
          <Link
            href='/auth/sign-up'
            className='inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium'
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  )
}
