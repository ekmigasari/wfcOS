import { User, PlanType } from "@/infrastructure/db/prisma/generated";
import { UserRepository } from "@/infrastructure/repo";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async createUser(data: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    planType?: PlanType;
  }): Promise<User> {
    return this.userRepository.create(data);
  }

  async updateUser(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepository.delete(id);
  }

  async upgradePlan(userId: string, planType: PlanType): Promise<User> {
    return this.userRepository.update(userId, { planType });
  }
}
