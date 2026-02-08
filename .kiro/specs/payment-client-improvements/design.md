# Design Document: Payment Client Improvements

## Overview

This design addresses two distinct issues in the Cashfree payment client implementation:

1. **Code Clarity**: Remove the unused `orderId` parameter from `openCashfreeCheckout` to eliminate confusion and reduce maintenance burden
2. **Correctness**: Fix the payment status handling logic to accurately distinguish between successful and failed payments

The solution involves updating the function signature, enhancing TypeScript type definitions to include payment status information, and implementing proper status checking logic. All changes maintain backward compatibility with existing payment flows while improving code quality and correctness.

## Architecture

The payment client follows a singleton pattern for SDK management and provides a simple async function interface for initiating checkout. The architecture remains unchanged, with improvements focused on:

- **Function Signature**: Simplified to accept only required parameters
- **Type System**: Enhanced to include payment status fields from the Cashfree SDK
- **Status Logic**: Updated to inspect actual payment status rather than assuming success

### Component Interaction

```
Call Sites (3 locations)
    ↓ paymentSessionId only
openCashfreeCheckout()
    ↓ checkout options
Cashfree SDK
    ↓ CheckoutResult with paymentDetails
Status Inspection Logic
    ↓ CheckoutResult with accurate success flag
Call Sites (handle result)
```

## Components and Interfaces

### Updated Function Signature

**Before:**
```typescript
export async function openCashfreeCheckout(
  paymentSessionId: string,
  orderId?: string  // Unused parameter
): Promise<CheckoutResult>
```

**After:**
```typescript
export async function openCashfreeCheckout(
  paymentSessionId: string
): Promise<CheckoutResult>
```

The `orderId` parameter is removed entirely. Call sites already have access to `orderId` in their local scope and use it for navigation after the checkout completes, so passing it to the function serves no purpose.

### Enhanced Type Definitions

The Cashfree SDK type definitions need to be enhanced to include payment status information:

```typescript
// src/types/cashfree.d.ts

declare module '@cashfreepayments/cashfree-js' {
    export interface LoadOptions {
        mode: 'sandbox' | 'production';
    }

    export interface CheckoutOptions {
        paymentSessionId: string;
        redirectTarget?: '_modal' | '_self' | '_blank' | '_top' | '_parent';
        returnUrl?: string;
    }

    // Enhanced to include payment status
    export interface PaymentDetails {
        paymentMessage?: string;
        paymentId?: string;
        paymentStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED';
        paymentAmount?: number;
        paymentTime?: string;
    }

    export interface CheckoutResult {
        error?: {
            message?: string;
            code?: string;
        };
        redirect?: boolean;
        paymentDetails?: PaymentDetails;
    }

    export interface CashfreeInstance {
        checkout: (options: CheckoutOptions) => Promise<CheckoutResult>;
    }

    export function load(options: LoadOptions): Promise<CashfreeInstance>;
}
```

**Key additions:**
- `paymentStatus` field with union type of known status values
- Additional optional fields (`paymentAmount`, `paymentTime`) for completeness
- All fields remain optional to maintain compatibility

### Updated Payment Status Logic

The current implementation always returns `success: true` when `paymentDetails` exists:

```typescript
// INCORRECT - Current implementation
if (result.paymentDetails) {
  return {
    success: true,  // Always true!
    message: result.paymentDetails.paymentMessage,
  };
}
```

The corrected implementation inspects the actual payment status:

```typescript
// CORRECT - New implementation
if (result.paymentDetails) {
  const status = result.paymentDetails.paymentStatus;
  const isSuccess = status === 'SUCCESS';
  
  console.log('Payment completed:', {
    status,
    message: result.paymentDetails.paymentMessage
  });
  
  return {
    success: isSuccess,
    message: result.paymentDetails.paymentMessage || 
             (isSuccess ? 'Payment successful' : 'Payment failed'),
  };
}
```

**Logic:**
1. Extract the `paymentStatus` field from `paymentDetails`
2. Check if status equals 'SUCCESS' (the only success case)
3. Return `success: true` only for 'SUCCESS' status
4. Return `success: false` for all other statuses ('FAILED', 'PENDING', 'USER_DROPPED', or undefined)
5. Provide appropriate fallback messages

### Call Site Updates

All three call sites need to be updated to remove the `orderId` argument:

**GroupRegistrationModal.tsx (line ~218):**
```typescript
// Before
const result = await openCashfreeCheckout(sessionId, orderId);

// After
const result = await openCashfreeCheckout(sessionId);
```

**RegistrationFormModal.tsx (line ~108):**
```typescript
// Before
const result = await openCashfreeCheckout(sessionId, orderId);

// After
const result = await openCashfreeCheckout(sessionId);
```

**app/register/pass/page.tsx (line ~77):**
```typescript
// Before
await openCashfreeCheckout(sessionId, orderId);

// After
await openCashfreeCheckout(sessionId);
```

Note: The `orderId` variable remains in scope at all call sites and is still used for navigation after payment completion.

## Data Models

### CheckoutResult Interface

```typescript
export interface CheckoutResult {
  success: boolean;
  message?: string;
}
```

This interface remains unchanged. It provides a simple, consistent return type for the checkout function.

### Payment Status Values

The payment status is represented as a union type:

```typescript
type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED';
```

**Status meanings:**
- `SUCCESS`: Payment completed successfully
- `FAILED`: Payment attempt failed (insufficient funds, card declined, etc.)
- `PENDING`: Payment is being processed (rare in modal checkout)
- `USER_DROPPED`: User closed the payment modal without completing payment

**Important:** Only `SUCCESS` should result in `success: true`. All other statuses indicate the payment did not complete successfully.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Payment status determines success flag

*For any* Cashfree SDK checkout result with payment details, the returned success flag should be true if and only if the paymentStatus is 'SUCCESS', and false for all other status values ('FAILED', 'PENDING', 'USER_DROPPED').

**Validates: Requirements 4.1, 4.2**

### Property 2: Failed payments include error messages

*For any* Cashfree SDK checkout result with payment details where paymentStatus is not 'SUCCESS', the returned CheckoutResult should include a non-empty message field.

**Validates: Requirements 4.4**

### Property 3: Error results return failure

*For any* Cashfree SDK checkout result containing an error object, the openCashfreeCheckout function should return success: false with the error message.

**Validates: Requirements 5.1, 5.3**

### Property 4: Redirect results return success

*For any* Cashfree SDK checkout result with redirect: true, the openCashfreeCheckout function should return success: true with an appropriate redirect message.

**Validates: Requirements 5.2**

## Error Handling

The payment client handles three distinct error scenarios:

### 1. SDK Errors (User Cancellation or Technical Errors)

When `result.error` is present, the user either closed the payment modal or a technical error occurred:

```typescript
if (result.error) {
  console.log('Payment error or popup closed:', result.error);
  return {
    success: false,
    message: result.error.message || 'Payment cancelled or failed',
  };
}
```

### 2. Payment Failures (Declined, Insufficient Funds, etc.)

When `result.paymentDetails` exists but `paymentStatus !== 'SUCCESS'`:

```typescript
if (result.paymentDetails) {
  const status = result.paymentDetails.paymentStatus;
  const isSuccess = status === 'SUCCESS';
  
  if (!isSuccess) {
    return {
      success: false,
      message: result.paymentDetails.paymentMessage || 'Payment failed',
    };
  }
}
```

### 3. Unknown Results

Fallback for unexpected SDK responses:

```typescript
return { 
  success: false, 
  message: 'Unknown payment result' 
};
```

### Safety Considerations

- **Default to failure**: When `paymentStatus` is missing or unrecognized, the function returns `success: false`
- **Server-side verification**: The client-side status is not authoritative; all payments must be verified server-side via the Cashfree verify API
- **Logging**: All payment outcomes are logged for debugging and audit purposes

## Testing Strategy

### Unit Tests

Unit tests should cover specific scenarios and edge cases:

1. **Function signature validation**: Verify the function accepts only `paymentSessionId` parameter
2. **Singleton pattern**: Verify `getCashfree()` returns the same instance on multiple calls
3. **Environment mode**: Verify SDK is initialized with correct mode based on environment variable
4. **Specific status examples**: Test each known status value ('SUCCESS', 'FAILED', 'PENDING', 'USER_DROPPED')
5. **Missing status field**: Test behavior when `paymentStatus` is undefined
6. **Missing message field**: Test fallback messages when `paymentMessage` is undefined
7. **Error object handling**: Test specific error codes and messages
8. **Redirect scenario**: Test the redirect path with `redirect: true`

### Property-Based Tests

Property tests should verify universal behaviors across all possible inputs:

1. **Property 1 (Status mapping)**: Generate random checkout results with various payment statuses and verify success flag is correct
2. **Property 2 (Error messages)**: Generate random failed payment results and verify messages are always present
3. **Property 3 (Error handling)**: Generate random error objects and verify they always return failure
4. **Property 4 (Redirect handling)**: Generate random redirect results and verify they always return success

### Test Configuration

- **Property test iterations**: Minimum 100 iterations per property test
- **Test tagging**: Each property test must include a comment referencing the design property
- **Tag format**: `// Feature: payment-client-improvements, Property {number}: {property_text}`
- **Mocking**: Mock the Cashfree SDK to control checkout results without making real API calls
- **TypeScript**: Use TypeScript for all tests to ensure type safety

### Integration Considerations

While unit and property tests verify the payment client in isolation, integration tests should verify:

- Call sites correctly handle both success and failure results
- Navigation to callback page occurs only on success
- Error messages are displayed to users appropriately
- Server-side payment verification is performed regardless of client-side result

These integration tests are outside the scope of this specification but should be considered in the broader testing strategy.
