import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not trust cookies alone, verify with Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Define public routes
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
  const isPublicAsset = pathname.startsWith("/_next") || 
                        pathname.startsWith("/favicon.ico") || 
                        pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

  // 1. Redirect unauthenticated users to login
  if (!user && !isAuthPage && !isPublicAsset) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 2. Redirect authenticated users away from auth pages to home
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
