import {
  User,
  Subscription,
  SubscriptionStatus,
} from "@/infrastructure/db/prisma/generated";
import { ProductPlan } from "@/infrastructure/config/productsPlan";

export interface ISubscription {
  id: string;
  startDate: Date;
  endDate: Date | null;
  canceledAt: Date | null;
  status: SubscriptionStatus;
  productId: string;
  amount: number;
  currency: string;
}

export interface CreateSubscriptionInput {
  userId: string;
  productId: string;
  status?: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date | null;
  amount: number;
  currency?: string;
}

export interface UpdateSubscriptionInput {
  id: string;
  productId?: string;
  status?: SubscriptionStatus;
  endDate?: Date | null;
  canceledAt?: Date | null;
  amount?: number;
  currency?: string;
}

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
