import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, type NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = new Response(request.body, {
    headers: { ...request.headers },
    status: request.status,
    statusText: request.statusText,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.headers.set(
            'Set-Cookie',
            `${name}=${value}; ${Object.entries(options)
              .map(([key, val]) => `${key}=${val}`)
              .join('; ')}`
          );
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
           response.headers.set(
            'Set-Cookie',
            `${name}=; ${Object.entries(options)
              .map(([key, val]) => `${key}=${val}`)
              .join('; ')}`
          );
        },
      },
    }
  )

  return { supabase, response }
}
