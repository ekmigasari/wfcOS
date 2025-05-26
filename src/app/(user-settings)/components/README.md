# Subscription Components

This directory contains the refactored subscription management components, organized following clean architecture principles.

## File Structure

### Main Component
- **`SubscriptionTab.tsx`** - Main container component that orchestrates all subscription functionality

### Sub-Components
- **`CurrentPlanCard.tsx`** - Displays current subscription plan details
- **`AvailablePlansCard.tsx`** - Shows all available plans with pricing and features
- **`PaymentHistoryCard.tsx`** - Displays subscription and payment history
- **`SubscriptionStates.tsx`** - Error, loading, and no-data state components

### Utilities
- **`subscription-utils.ts`** - Helper functions for date formatting, status colors, and plan utilities
- **`subscription-mock-data.ts`** - Mock data generation for testing different subscription states

## Testing Different Plans

To test different subscription states, modify the `MOCKED_ACTIVE_PLAN` variable in `SubscriptionTab.tsx`:

```typescript
const MOCKED_ACTIVE_PLAN = PlanType.YEARLY; // Change this value
```

Available options:
- `null` - Free plan (no active subscription)
- `PlanType.MONTHLY` - Active monthly subscription
- `PlanType.YEARLY` - Active yearly subscription  
- `PlanType.LIFETIME` - Active lifetime subscription

## Switching to Production

To use real data instead of mock data:

1. Comment out the mock SWR section
2. Uncomment the production SWR section
3. Uncomment the `UserWithSubscriptions` interface and `fetcher` function

## Architecture Benefits

- **High Cohesion**: Related functionality is grouped together
- **Low Coupling**: Components are independent and reusable
- **Separation of Concerns**: UI, logic, and data are properly separated
- **Testability**: Mock data utilities make testing easy
- **Maintainability**: Smaller, focused files are easier to understand and modify 