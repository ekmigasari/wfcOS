import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "@/application/types";
import {
  Subscription,
  SubscriptionStatus,
} from "@/infrastructure/db/prisma/generated";
import { prisma } from "@/infrastructure/utils/prisma";

export class SubscriptionRepository {
  async findById(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where: { userId },
    });
  }

  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
    });
  }

  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    return prisma.subscription.create({
      data: {
        ...data,
        status: data.status || SubscriptionStatus.ACTIVE,
        startDate: data.startDate || new Date(),
      },
    });
  }

  async update(
    id: string,
    data: UpdateSubscriptionInput
  ): Promise<Subscription> {
    return prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async cancel(id: string): Promise<Subscription> {
    return prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Subscription> {
    return prisma.subscription.delete({
      where: { id },
    });
  }

  async updateExpiredSubscriptions(): Promise<number> {
    const result = await prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          not: null,
          lt: new Date(),
        },
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });
    return result.count;
  }
}
