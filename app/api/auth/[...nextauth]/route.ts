import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// ✅ Add this line for Cloudflare Pages
export const runtime = 'edge'