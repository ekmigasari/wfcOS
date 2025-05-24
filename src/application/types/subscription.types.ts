import {
  User,
  Subscription,
  SubscriptionStatus,
} from "@/infrastructure/db/prisma/generated";
import { ProductPlan } from "@/infrastructure/config/productsPlan";

export interface SubscriptionData {
  user: User;
  currentSubscription: Subscription | null;
  currentPlan: ProductPlan | undefined;
  allPlans: ProductPlan[];
  paymentHistory: PaymentHistoryItem[];
  hasActiveSubscription: boolean;
}

export interface PaymentHistoryItem {
  date: Date;
  amount: number;
  status: SubscriptionStatus;
  subscription: Subscription;
}

export interface CreateSubscriptionInput {
  userId: string;
  productId: string;
  status?: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date | null;
}

export interface UpdateSubscriptionInput {
  id: string;
  productId?: string;
  status?: SubscriptionStatus;
  endDate?: Date | null;
  canceledAt?: Date | null;
}
