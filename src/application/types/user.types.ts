import {
  PlanType,
  Subscription,
  User,
} from "@/infrastructure/db/prisma/generated";

// User profile data (public-facing)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  planType: PlanType;
  createdAt: Date;
}

// User creation input (without auto-generated fields)
export interface CreateUserInput {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  planType?: PlanType;
}

// User update input (all fields optional except id)
export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string | null;
  planType?: PlanType;
}

export interface UserMembership {
  name: string;
  issuedDate: string;
  expiresDate: string;
  planType: PlanType;
  subcriptions: Subscription[];
}

export interface UserWithSubscriptions extends User {
  subscriptions: Subscription[];
}
