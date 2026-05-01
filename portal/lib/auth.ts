import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Comma-separated list of Google emails allowed into the Brewery.
// Set BREWERY_ALLOWED_EMAILS=you@gmail.com in portal/.env
const ALLOWED = (process.env.BREWERY_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      const email = user.email?.toLowerCase() ?? ''
      return ALLOWED.includes(email)
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
