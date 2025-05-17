import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";

const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [polarClient()],
});

export const { signIn, signUp, signOut, useSession, getSession, updateUser } =
  authClient;
