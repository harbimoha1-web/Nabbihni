import { translations, Language } from '@/locales/translations';

// Conditional import of react-native-purchases (native module not available in Expo Go)
let PURCHASES_ERROR_CODE: typeof import('react-native-purchases').PURCHASES_ERROR_CODE | null = null;

try {
  const module = require('react-native-purchases');
  PURCHASES_ERROR_CODE = module.PURCHASES_ERROR_CODE;
} catch (e) {
  // Module not available in Expo Go - that's fine
}

// Type for PurchasesError (declared here to avoid import crash)
type PurchasesError = {
  code: number;
  message?: string;
};

export interface SubscriptionErrorMessage {
  title: string;
  message: string;
}

/**
 * Get localized error message for RevenueCat purchase errors
 */
export function getSubscriptionErrorMessage(error: PurchasesError, lang: Language = 'ar'): SubscriptionErrorMessage {
  const t = translations[lang].errors;

  // If native module not available, return generic error
  if (!PURCHASES_ERROR_CODE) {
    return {
      title: t.purchaseFailed,
      message: t.purchaseFailedDesc,
    };
  }

  // Cast to any: error.code is number, PURCHASES_ERROR_CODE values are a numeric enum.
  // The conditional require() prevents TypeScript from resolving the comparison statically.
  switch (error.code as any) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return {
        title: t.purchaseCancelled,
        message: t.purchaseCancelledDesc,
      };

    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return {
        title: t.networkError,
        message: t.networkErrorDesc,
      };

    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return {
        title: t.paymentPending,
        message: t.paymentPendingDesc,
      };

    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return {
        title: t.purchaseNotAllowed,
        message: t.purchaseNotAllowedDesc,
      };

    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return {
        title: t.productNotAvailable,
        message: t.productNotAvailableDesc,
      };

    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
      return {
        title: t.receiptInUse,
        message: t.receiptInUseDesc,
      };

    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
      return {
        title: t.storeProblem,
        message: t.storeProblemDesc,
      };

    case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
    case PURCHASES_ERROR_CODE.INVALID_RECEIPT_ERROR:
      return {
        title: t.verificationError,
        message: t.verificationErrorDesc,
      };

    case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
    case PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR:
      return {
        title: t.technicalError,
        message: t.technicalErrorDesc,
      };

    default:
      return {
        title: t.purchaseFailed,
        message: t.purchaseFailedDesc,
      };
  }
}

/**
 * Check if the error is a user cancellation (should not show error alert)
 */
export function isUserCancellation(error: PurchasesError): boolean {
  if (!PURCHASES_ERROR_CODE) return false;
  return (error.code as any) === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}
