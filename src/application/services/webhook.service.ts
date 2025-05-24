import { PolarWebhookPayload } from "@/infrastructure/utils/polarSignature";
import { SubscriptionService } from "./subscription.service";
import { UserService } from "./user.service";
import { SubscriptionStatus } from "@/infrastructure/db/prisma/generated";

// Create instances of the services
const subscriptionService = new SubscriptionService();
const userService = new UserService();

/**
 * Handles incoming webhook events from Polar
 * @param payload The webhook payload from Polar
 */
export async function webhookHandler(
  payload: PolarWebhookPayload
): Promise<void> {
  const { type, data } = payload;

  console.log(`Processing webhook event: ${type}`);

  switch (type) {
    // Customer events
    case "customer.created":
      await handleCustomerCreated(data);
      break;
    case "customer.updated":
      await handleCustomerUpdated(data);
      break;
    case "customer.state_changed":
      await handleCustomerStateChanged(data);
      break;

    // Subscription events
    case "subscription.created":
      await handleSubscriptionCreated(data);
      break;
    case "subscription.updated":
      await handleSubscriptionUpdated(data);
      break;
    case "subscription.active":
      await handleSubscriptionActive(data);
      break;
    case "subscription.canceled":
      await handleSubscriptionCanceled(data);
      break;
    case "subscription.revoked":
      await handleSubscriptionRevoked(data);
      break;

    // Order events
    case "order.created":
      await handleOrderCreated(data);
      break;
    case "order.paid":
      await handleOrderPaid(data);
      break;

    default:
      console.log(`Unhandled webhook event type: ${type}`);
  }
}

// Customer event handlers
async function handleCustomerCreated(
  data: Record<string, unknown>
): Promise<void> {
  // Implement customer creation logic here
  console.log("Customer created:", data);

  // Example: Create or update user in your system based on Polar customer
  const email = data.email as string;
  if (email) {
    const existingUser = await userService.getUserByEmail(email);
    if (!existingUser) {
      // Create new user if doesn't exist
      console.log(`Creating new user for email: ${email}`);
    }
  }
}

async function handleCustomerUpdated(
  data: Record<string, unknown>
): Promise<void> {
  // Implement customer update logic here
  console.log("Customer updated:", data);
}

async function handleCustomerStateChanged(
  data: Record<string, unknown>
): Promise<void> {
  // Update user benefits based on new customer state
  const customerId = data.customer_id as string;
  const benefits = data.benefits as unknown[];

  if (customerId && benefits && benefits.length > 0) {
    console.log(`Updating customer ${customerId} with new benefits`);
    // You could update user privileges based on benefits
  }
}

// Subscription event handlers
async function handleSubscriptionCreated(
  data: Record<string, unknown>
): Promise<void> {
  const userId = data.customer_id as string; // Assuming customer_id maps to your userId
  const productId = data.plan_id as string; // Assuming plan_id maps to your productId

  await subscriptionService.createSubscription({
    userId,
    productId,
    status: SubscriptionStatus.ACTIVE,
    startDate: new Date(),
    endDate: data.current_period_end
      ? new Date(data.current_period_end as string)
      : undefined,
  });
}

async function handleSubscriptionUpdated(
  data: Record<string, unknown>
): Promise<void> {
  const subscriptionId = data.id as string;
  const status = data.status as string;

  await subscriptionService.updateSubscription(subscriptionId, {
    status: mapPolarStatusToSubscriptionStatus(status),
    endDate: data.current_period_end
      ? new Date(data.current_period_end as string)
      : undefined,
  });
}

async function handleSubscriptionActive(
  data: Record<string, unknown>
): Promise<void> {
  const subscriptionId = data.id as string;
  await subscriptionService.updateSubscription(subscriptionId, {
    status: SubscriptionStatus.ACTIVE,
  });
}

async function handleSubscriptionCanceled(
  data: Record<string, unknown>
): Promise<void> {
  const subscriptionId = data.id as string;
  await subscriptionService.cancelSubscription(subscriptionId);
}

async function handleSubscriptionRevoked(
  data: Record<string, unknown>
): Promise<void> {
  const subscriptionId = data.id as string;
  await subscriptionService.updateSubscription(subscriptionId, {
    status: SubscriptionStatus.CANCELED,
  });
}

// Order event handlers
async function handleOrderCreated(
  data: Record<string, unknown>
): Promise<void> {
  console.log("Order created:", data);
  const billingReason = data.billing_reason as string;

  if (billingReason === "subscription_cycle") {
    // Handle subscription renewal
    const subscriptionId = data.subscription_id as string;
    const endDate = data.current_period_end
      ? new Date(data.current_period_end as string)
      : new Date();

    if (subscriptionId) {
      await subscriptionService.processSubscriptionRenewal(
        subscriptionId,
        endDate
      );
    }
  }
}

async function handleOrderPaid(data: Record<string, unknown>): Promise<void> {
  console.log("Order paid:", data);
  // You could update payment status in your system
}

// Helper function to map Polar status to your internal status enum
function mapPolarStatusToSubscriptionStatus(
  polarStatus: string
): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    canceled: SubscriptionStatus.CANCELED,
    revoked: SubscriptionStatus.CANCELED,
    // Add more mappings as needed
  };

  return statusMap[polarStatus.toLowerCase()] || SubscriptionStatus.ACTIVE;
}
