import {
  Subscription,
  SubscriptionStatus,
  PlanType,
} from "@/infrastructure/db/prisma/generated";
import { SubscriptionRepository, UserRepository } from "@/infrastructure/repo";

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private userRepository: UserRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
    this.userRepository = new UserRepository();
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async getActiveUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const activeSubscriptions =
      await this.subscriptionRepository.findActiveByUserId(userId);
    return activeSubscriptions.length > 0;
  }

  async createSubscription(data: {
    userId: string;
    productId: string;
    status?: SubscriptionStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Subscription> {
    return this.subscriptionRepository.create(data);
  }

  async updateSubscription(
    id: string,
    data: Partial<Omit<Subscription, "id">>
  ): Promise<Subscription> {
    return this.subscriptionRepository.update(id, data);
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return this.subscriptionRepository.cancel(id);
  }

  async cancelUserSubscriptions(userId: string): Promise<number> {
    const subscriptions = await this.subscriptionRepository.findActiveByUserId(
      userId
    );
    let count = 0;

    for (const subscription of subscriptions) {
      await this.subscriptionRepository.cancel(subscription.id);
      count++;
    }

    return count;
  }

  async deleteSubscription(id: string): Promise<Subscription> {
    return this.subscriptionRepository.delete(id);
  }

  async processSubscriptionRenewal(
    subscriptionId: string,
    endDate: Date
  ): Promise<Subscription> {
    return this.subscriptionRepository.update(subscriptionId, {
      endDate,
    });
  }

  async updateExpiredSubscriptions(): Promise<number> {
    return this.subscriptionRepository.updateExpiredSubscriptions();
  }

  async syncUserPlanWithSubscription(userId: string): Promise<void> {
    const activeSubscriptions =
      await this.subscriptionRepository.findActiveByUserId(userId);

    // If no active subscriptions, set plan to FREE
    if (activeSubscriptions.length === 0) {
      await this.userRepository.update(userId, { planType: PlanType.FREE });
      return;
    }

    // Map product IDs to plan types
    const planMap: { [key: string]: PlanType } = {
      lifetime: PlanType.LIFETIME,
      yearly: PlanType.YEARLY,
      monthly: PlanType.MONTHLY,
    };

    // Priority order (higher number = higher priority)
    const planPriority: { [key in PlanType]: number } = {
      [PlanType.LIFETIME]: 3,
      [PlanType.YEARLY]: 2,
      [PlanType.MONTHLY]: 1,
      [PlanType.FREE]: 0,
    };

    let highestPlan = PlanType.FREE;

    for (const subscription of activeSubscriptions) {
      const planId = subscription.productId.toLowerCase();

      // Find matching plan type based on product ID
      for (const [keyword, planType] of Object.entries(planMap)) {
        if (planId.includes(keyword)) {
          // If this plan has higher priority than current highest, update it
          if (planPriority[planType] > planPriority[highestPlan]) {
            highestPlan = planType;
          }
          break;
        }
      }
    }

    // Update user's plan type
    await this.userRepository.update(userId, { planType: highestPlan });
  }
}
