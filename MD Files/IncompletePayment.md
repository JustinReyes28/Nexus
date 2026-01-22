# Code Fixes Summary

## `@src/components/settings/BillingSettings.tsx`

### Issue 1: Replace Hardcoded Delay with Real Stripe Confirmation (Lines 107-111)

**Problem:** The code uses a hardcoded 3-second delay instead of actual Stripe payment confirmation.

**Solution:** Remove the placeholder delay and implement proper Stripe.js client-side confirmation.

```tsx
// Before:
const { paymentIntentId, clientSecret } = await createResponse.json();
// Simulate payment processing
await new Promise((resolve) => setTimeout(resolve, 3000));

// After:
const { paymentIntentId, clientSecret } = await createResponse.json();

// Initialize Stripe if not already done
if (!stripe) {
  stripe = await getStripe();
}

const cardElement = elements.getElement(CardElement);
if (!cardElement) {
  throw new Error("Card element not found");
}

// Complete payment client-side
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    // Add billing details if needed
    // billing_details: { ... }
  },
});

if (error) {
  // Handle payment failure
  throw new Error(error.message);
}

// Payment succeeded, continue with server-side webhook handling
// Keep paymentIntentId for state correlation
```

### Issue 2: Fix Premium Upgrade Modal Logic (Lines 130-134)

**Problem:** The modal shows for all Premium users instead of only those who transitioned from FREE to PREMIUM.

**Solution:** Compare previous tier with new tier to detect transitions.

```tsx
// Before:
if (result.user.tier === "PREMIUM") {
  setUpgradedFromFree(true);
  setShowUpgradeModal(true);
}

// After:
// Store current tier before purchase
const previousTier = user.tier; // Assuming 'user' state exists

// After successful purchase:
if (previousTier === "FREE" && result.user.tier === "PREMIUM") {
  setUpgradedFromFree(true);
  setShowUpgradeModal(true);
}
```

### Issue 3: Fix Spinner Visibility (Lines 209-216)

**Problem:** The spinner uses `border-white` which can be invisible on light backgrounds.

**Solution:** Use a color-agnostic border class for better visibility.

```tsx
// Before:
<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />

// After:
<div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-neutral-600" />
// OR: Use border-current to inherit text color
<div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
```

### Issue 4: Dynamic Credit Amount in Modal (Lines 270-272)

**Problem:** Modal shows hardcoded "1000" credits instead of the actual purchased amount.

**Solution:** Store and display the actual purchased credit amount.

```tsx
// Add state for purchased credits
const [purchaseCredits, setPurchaseCredits] = useState<number>(0);

// Update in purchase handler
const handlePurchase = async (bundle: Bundle) => {
  // ... purchase logic

  // After successful purchase
  if (result.credits) {
    setPurchaseCredits(result.credits);
  }

  // Or get from bundle if not in response
  // setPurchaseCredits(bundle.credits);
};

// Update modal text
// Before:
<p>Your account has been credited with {upgradedFromFree ? "1000" : "1000"} credits.</p>

// After:
<p>Your account has been credited with {purchaseCredits} credits.</p>
```

## `@src/app/api/payments/create/route.ts`

### Issue 5: Distinguish Authentication Errors (Lines 27-33)

**Problem:** All errors return 401, including server errors.

**Solution:** Add proper error classification.

```tsx
// Before:
} catch (error) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

// After:
} catch (error) {
  // Check if it's an authentication error
  if (error instanceof AuthError || error.name === 'AuthError') {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Log server errors
  console.error("Payment creation error:", error);

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### Issue 6: Handle JSON Parsing Errors (Lines 10-11)

**Problem:** Direct JSON parsing without error handling.

**Solution:** Wrap `request.json()` in try-catch.

```tsx
// Before:
const { bundleType } = await request.json();

// After:
let body;
try {
  body = await request.json();
} catch (error) {
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
  throw error;
}

const { bundleType } = body;
```

## `@src/app/api/payments/history/route.ts`

### Issue 7: Add Pagination (Lines 9-12)

**Problem:** Unbounded query returns all payments.

**Solution:** Implement pagination with limits and metadata.

```tsx
// Before:
const payments = await db.payment.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
});

// After:
// Get pagination parameters
const searchParams = request.nextUrl.searchParams;
const page = parseInt(searchParams.get("page") || "1");
const pageSize = Math.min(
  parseInt(searchParams.get("pageSize") || "20"),
  100, // Maximum page size
);
const skip = (page - 1) * pageSize;

// Get total count for metadata
const totalCount = await db.payment.count({
  where: { userId: user.id },
});

// Get paginated results
const payments = await db.payment.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
  skip,
  take: pageSize,
});

// Return with pagination metadata
return NextResponse.json({
  payments,
  pagination: {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNext: page * pageSize < totalCount,
    hasPrev: page > 1,
  },
});
```

### Issue 8: Distinguish Authentication Errors in GET (Lines 5-21)

**Problem:** All exceptions return 500, including auth failures.

**Solution:** Add authentication error detection.

```tsx
// Before:
} catch (error) {
  console.error(error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

// After:
} catch (error) {
  // Check for authentication errors
  if (error instanceof AuthError || error.name === 'AuthError') {
    return NextResponse.json(
      { error: "Unauthenticated" },
      { status: 401 }
    );
  }

  console.error("Payments history error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## `@src/lib/payments.ts`

### Issue 9: Fix Unused Request Parameter (Lines 103-111)

**Problem:** `verifyAuthenticatedUser` declares unused `request` parameter.

**Solution:** Either remove the parameter or use it properly.

```tsx
// Option 1: Remove parameter (if not needed)
export async function verifyAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  // ... rest of function
}

// Option 2: Use parameter (if NextAuth requires it)
export async function verifyAuthenticatedUser(request?: Request) {
  const session = await getServerSession(
    request ? { req: request, ...authOptions } : authOptions,
  );
  // ... rest of function
}
```

### Issue 10: Add Idempotency Check (Lines 29-35)

**Problem:** No check for duplicate payment processing.

**Solution:** Add idempotency check using `paymentIntentId`.

```tsx
// Inside the transaction block:
const existingPayment = await tx.payment.findUnique({
  where: { paymentIntentId },
});

if (existingPayment) {
  // Payment already processed, return existing data
  console.log(`Payment ${paymentIntentId} already processed`);
  return {
    success: true,
    message: "Payment already processed",
    credits: 0,
  };
}

// Proceed with credit granting...
```
