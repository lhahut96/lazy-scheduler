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
    async jwt({ token, account }) {
      console.log(token.expires_at);
      if (account) {
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        token.access_token = account.access_token
          ? account.access_token
          : token.access_token;
        token.expires_at = account.expires_at
          ? account.expires_at
          : token.expires_at;
        token.refresh_token = account.refresh_token;
        return token;
      } else if (Date.now() < token.expires_at * 1000) {
        // Subsequent logins, but the `access_token` is still valid
        return token;
      } else {
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");

        try {
          console.log("refreshing token");
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token!,
            }),
          });

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in
          );
          // Some providers only issue refresh tokens once, so preserve if we did not get a new one
          if (newTokens.refresh_token)
            token.refresh_token = newTokens.refresh_token;
          return token;
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      session.accessToken = token.access_token;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}

export { handler as GET, handler as POST };
