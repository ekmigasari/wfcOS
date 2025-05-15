import { signIn } from "@/infrastructure/lib/auth-client";

export class AuthService {
  async GoogleSignIn() {
    await signIn.social({ provider: "google" });
  }
}
