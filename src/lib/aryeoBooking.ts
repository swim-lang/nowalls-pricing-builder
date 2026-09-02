import { ARYEO_ORDER_FORM_URL, PACKAGE_CONFIG, getCatalogVariant } from "../../shared/aryeoCatalog";
import type {
  BookingSessionErrorBody,
  BookingSessionRequest,
  BookingSessionResult,
} from "../../shared/bookingContract";

export type { BookingSessionRequest } from "../../shared/bookingContract";
export type { BookingSessionResult } from "../../shared/bookingContract";

const FALLBACK_NOTICE = "We could not carry your details into Aryeo. You can still continue in the live No Walls order form.";

const isTrustedBookingUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "nowalls.aryeo.com" && url.pathname.startsWith("/order-form");
  } catch {
    return false;
  }
};

const fallbackResult = (request: BookingSessionRequest, notice = FALLBACK_NOTICE): BookingSessionResult => {
  const packageConfig = PACKAGE_CONFIG.packages[request.selection.packageId];
  const variant = getCatalogVariant(request.selection.packageId, request.selection.variantKey) || packageConfig.variants[0];
  return {
    bookingUrl: ARYEO_ORDER_FORM_URL,
    carriesCustomerDetails: false,
    mode: "fallback",
    notice,
    selection: {
      packageName: packageConfig.name,
      variantLabel: variant.label,
      price: variant.price,
    },
  };
};

export async function requestBookingSession(request: BookingSessionRequest): Promise<BookingSessionResult> {
  if (window.location.hostname.endsWith("github.io")) {
    return fallbackResult(request, "This static preview cannot carry details into Aryeo. Continue in the live order form to finish booking.");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch("/api/booking-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as BookingSessionResult | BookingSessionErrorBody | null;
    if (response.ok && body && "bookingUrl" in body && isTrustedBookingUrl(body.bookingUrl)) return body;

    if (response.status === 400 && body && "error" in body) {
      const message = body.error?.message || "Please review the booking details and try again.";
      throw new Error(message);
    }

    return fallbackResult(request, body && "error" in body ? body.error?.message || FALLBACK_NOTICE : FALLBACK_NOTICE);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Please correct")) throw error;
    return fallbackResult(request);
  } finally {
    window.clearTimeout(timeout);
  }
}
