import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

type GoogleProfile = {
  email?: string | null;
  name?: string | null;
  sub?: string;
  picture?: string | null;
  image?: string | null;
};

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            return { 
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              accessToken: data.token,
              role: data.user.role || 'USER',
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as GoogleProfile;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: googleProfile.email,
              name: googleProfile.name,
              googleId: googleProfile.sub,
              avatar: googleProfile.picture || googleProfile.image || null,
            }),
          });

          const data = await res.json();
          if (res.ok && data.token) {
            token.accessToken = data.token;
            token.id = data.user.id;
            token.name = data.user.name;
            token.email = data.user.email;
            token.role = data.user.role || 'USER';
          }
        } catch (error) {
          console.error('Google auth token exchange failed', error);
        }
      }

      if (user && account?.provider !== 'google') {
        token.role = user.role || 'USER';
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken || '';
      session.user.id = token.id || '';
      session.user.role = token.role;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
