import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If the user is authenticated and requests the home page, redirect to dashboard
    if (req.nextUrl.pathname === "/") {
      // For now we don't strict redirect from root, but we could
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/home/:path*",
    "/profile/:path*",
    "/trips/:path*"
  ]
}
