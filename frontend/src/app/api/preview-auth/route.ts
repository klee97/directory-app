import { isProduction } from '@/lib/env/env'
import { apiError, apiSuccess } from '@/lib/api/respond'
import { NextRequest } from 'next/server'
import { PREVIEW_COOKIE } from '@/lib/blogPreview/constants'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.BLOG_PREVIEW_PASSWORD) {
    return apiError('Unauthorized', 401)
  }

  const response = apiSuccess({})
  response.cookies.set(PREVIEW_COOKIE, process.env.BLOG_PREVIEW_PASSWORD!, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
  return response
}