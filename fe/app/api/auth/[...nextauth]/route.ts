import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const { GOOGLE_CLIENT_ID = "", GOOGLE_CLIENT_SECRET = "" } = process.env;

const google = GoogleProvider({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
      scope: "openid https://www.googleapis.com/auth/calendar",
    },
  },
});

const handler = NextAuth({
  providers: [google],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account) {
        console.log(account);
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        accessToken: token.accessToken,
        idToken: token.idToken,
      };
    },
  },
});

export { handler as GET, handler as POST };
