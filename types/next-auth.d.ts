import 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    establishmentId: string
    establishmentSlug: string
    categorySlug: string
  }
}
