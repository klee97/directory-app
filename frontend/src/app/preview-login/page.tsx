import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import PasswordGate from '@/components/ui/PasswordGate'

export default function PreviewLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  return (
    <Suspense>
      <PasswordGateWrapper searchParams={searchParams} />
    </Suspense>
  )
}

async function PasswordGateWrapper({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  if (!redirectTo) {
    redirect('/blog')
  }

  return <PasswordGate redirectTo={redirectTo} />
}