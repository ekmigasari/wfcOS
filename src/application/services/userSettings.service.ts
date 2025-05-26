
import { User } from "@/infrastructure/db/prisma/generated";
import { UserRepository } from "@/infrastructure/repo";


export class UserSettingsService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserSettingsData(id: string): Promise<User | null> {
    const user = await this.userRepository.getUserWithSubscription(id);
    return user;
  }
}
