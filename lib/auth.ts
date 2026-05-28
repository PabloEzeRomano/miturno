import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    establishmentId: string
    establishmentSlug: string
    categorySlug: string
    user: {
      id: string
      name?: string | null
      email?: string | null
    }
  }
}

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
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { establishment: { include: { category: true } } },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          establishmentId: user.establishmentId ?? '',
          establishmentSlug: user.establishment?.slug ?? '',
          categorySlug: user.establishment?.category?.slug ?? 'barberia',
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.establishmentId = (user as { establishmentId: string }).establishmentId
        token.establishmentSlug = (user as { establishmentSlug: string }).establishmentSlug
        token.categorySlug = (user as { categorySlug: string }).categorySlug
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      ;(session as { establishmentId?: string }).establishmentId = token.establishmentId as string
      ;(session as { establishmentSlug?: string }).establishmentSlug = token.establishmentSlug as string
      ;(session as { categorySlug?: string }).categorySlug = token.categorySlug as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
})
