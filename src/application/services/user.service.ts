import { User, PlanType } from "@/infrastructure/db/prisma/generated";
import { UserRepository } from "@/infrastructure/repo";
import { CreateUserInput, UpdateUserInput } from "@/application/types";

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

  async createUser(data: CreateUserInput): Promise<User> {
    return this.userRepository.create(data);
  }

  async updateUser(
    id: string,
    data: Partial<Omit<UpdateUserInput, "id">>
  ): Promise<User> {
    return this.userRepository.update(id, { id, ...data });
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepository.delete(id);
  }

  async upgradePlan(userId: string, planType: PlanType): Promise<User> {
    return this.userRepository.update(userId, { id: userId, planType });
  }
}
