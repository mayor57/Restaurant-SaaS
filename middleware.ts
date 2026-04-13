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
  
  // Define public routes explicitly (Allowlist)
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
  
  // Match Next.js internals and static assets
  const isPublicAsset = pathname.startsWith("/_next") || 
                        pathname.startsWith("/favicon.ico") || 
                        pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

  // 1. Redirect unauthenticated users to login for ANY protected route
  if (!user && !isAuthPage && !isPublicAsset) {
    const url = new URL("/login", request.url)
    // Optional: save the attempt URL to redirect back after login
    // url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // 2. Redirect authenticated users away from auth pages to home
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
