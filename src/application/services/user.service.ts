import {
  User,
  PlanType,
  Subscription,
  SubscriptionStatus,
} from "@/infrastructure/db/prisma/generated";
import { UserRepository } from "@/infrastructure/repo";
import {
  CreateUserInput,
  UpdateUserInput,
  UserMembership,
  UserWithSubscriptions,
} from "@/application/types";
import { getUserSubscription } from "@/app/(user-settings)/components/subscription-mock-data";

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

  async userMembership(): Promise<UserMembership> {
    // Comment out repository call for now
    // const user = await this.userRepository.getUserWithSubscription(userId) as UserWithSubscriptions | null;

    // Use mock data instead
    const mockData = getUserSubscription;
    const user = {
      ...mockData.user,
      planType: mockData.user.planType as PlanType,
      createdAt: new Date(mockData.user.createdAt),
      updatedAt: new Date(mockData.user.updatedAt),
      subscriptions: mockData.subscriptions.map((sub) => ({
        ...sub,
        status: sub.status as SubscriptionStatus,
        startDate: new Date(sub.startDate),
        endDate: sub.endDate ? new Date(sub.endDate) : null,
        canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : null,
      })),
    } as UserWithSubscriptions;

    if (!user) {
      throw new Error("User not found");
    }

    const subcriptions = user.subscriptions;

    // For FREE members, use account creation date as issued date
    if (user.planType === PlanType.FREE) {
      return {
        name: user.name,
        issuedDate: new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        expiresDate: "N/A",
        planType: user.planType,
        subcriptions,
      };
    }

    // For paid members, get the active subscription
    const activeSubscription = user.subscriptions?.find(
      (sub: Subscription) => sub.status === SubscriptionStatus.ACTIVE
    );

    // Format dates from subscription
    const issuedDate = activeSubscription?.startDate
      ? new Date(activeSubscription.startDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    const expiresDate = activeSubscription?.endDate
      ? new Date(activeSubscription.endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : user.planType === PlanType.LIFETIME
      ? "Never"
      : "N/A";

    return {
      name: user.name,
      issuedDate,
      expiresDate,
      planType: user.planType,
      subcriptions,
    };
  }
}
