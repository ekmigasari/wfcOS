import { headers } from "next/headers";
import { User } from "@/infrastructure/db/prisma/generated";
import { UserRepository } from "@/infrastructure/repo";
import { auth } from "@/infrastructure/utils/auth";
import { UserSession } from "../types";

export class UserSettingsService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserSettingsData(): Promise<UserSession | null> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session;
  }
}
