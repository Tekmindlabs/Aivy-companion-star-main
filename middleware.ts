import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*", 
    "/knowledge/:path*",
    '/profile/:path*'
  ],
};