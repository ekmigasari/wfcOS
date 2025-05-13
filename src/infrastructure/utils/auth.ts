import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";
import { polar } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const prisma = new PrismaClient();

const client = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    polar({
      client,
      // Enable automatic Polar Customer creation on signup
      createCustomerOnSignUp: true,
      // Enable customer portal
      enableCustomerPortal: true, // Deployed under /portal for authenticated users
      // Configure checkout
      checkout: {
        enabled: true,
        products: [
          {
            productId: "123-456-789", // ID of Product from Polar Dashboard
            slug: "pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
          },
        ],
        successUrl: "/success?checkout_id={CHECKOUT_ID}",
        authenticatedUsersOnly: true,
      },
      // // Incoming Webhooks handler will be installed at /polar/webhooks
      // webhooks: {
      //     secret: process.env.POLAR_WEBHOOK_SECRET,
      //     onPayload: ...,
      // }
    }),
  ],
});
