import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const barber = await prisma.barber.findUnique({
          where: { email: credentials.email as string },
        })
        if (!barber) return null
        const valid = await bcrypt.compare(credentials.password as string, barber.password)
        if (!valid) return null
        return {
          id: barber.id,
          email: barber.email,
          name: barber.name,
          slug: barber.slug,
          shopName: barber.shopName,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.barberId = user.id
        token.slug = (user as { slug: string }).slug
        token.shopName = (user as { shopName: string }).shopName
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.barberId as string
      ;(session as { barberId?: string }).barberId = token.barberId as string
      ;(session as { slug?: string }).slug = token.slug as string
      ;(session as { shopName?: string }).shopName = token.shopName as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
