import { ARYEO_ORDER_FORM_ID, ARYEO_ORDER_FORM_URL } from "../shared/aryeoCatalog.js";
import {
  AryeoApiError,
  BookingValidationError,
  buildAryeoSessionPayload,
  buildDirectHandoff,
  createAryeoOrderFormSession,
  validateBookingRequest,
} from "./_lib/booking.js";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: responseHeaders });

async function handleBookingSession(request: Request): Promise<Response> {
  const bookingEnabled = process.env.ARYEO_BOOKING_ENABLED === "true";
  const apiKey = process.env.ARYEO_API_KEY?.trim();
  const orderFormId = process.env.ARYEO_ORDER_FORM_ID?.trim() || ARYEO_ORDER_FORM_ID;

  if (request.method === "GET") {
    return json({
      ok: true,
      service: "no-walls-aryeo-booking",
      configured: bookingEnabled && Boolean(apiKey),
      mode: bookingEnabled ? "live" : "direct-order-form",
      orderFormUrl: ARYEO_ORDER_FORM_URL,
    });
  }

  if (request.method !== "POST") {
    return json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST to prepare a booking." } }, 405);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 32_000) {
    return json({ error: { code: "PAYLOAD_TOO_LARGE", message: "The booking request is too large." } }, 413);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Send the booking request as JSON." } }, 415);
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ error: { code: "INVALID_JSON", message: "The booking request could not be read." } }, 400);
  }

  try {
    const validated = validateBookingRequest(input);

    // Honeypot submissions never create Aryeo sessions.
    if (validated.companyWebsite) return json(buildDirectHandoff(validated));

    if (!bookingEnabled) return json(buildDirectHandoff(validated));

    if (!apiKey) {
      return json(
        {
          error: { code: "ARYEO_NOT_CONFIGURED", message: "Secure detail transfer is temporarily unavailable." },
          fallbackUrl: ARYEO_ORDER_FORM_URL,
        },
        503,
      );
    }

    const payload = buildAryeoSessionPayload(validated, orderFormId, process.env.ARYEO_SUCCESS_URL?.trim() || undefined);
    const bookingUrl = await createAryeoOrderFormSession(apiKey, payload);

    return json({
      bookingUrl,
      carriesCustomerDetails: true,
      mode: "aryeo-session",
      selection: {
        packageName: validated.packageConfig.name,
        variantLabel: validated.variant.label,
        price: validated.variant.price,
      },
    });
  } catch (error) {
    if (error instanceof BookingValidationError) {
      return json(
        {
          error: {
            code: "INVALID_BOOKING_REQUEST",
            message: error.message,
            fields: error.fields,
          },
          fallbackUrl: ARYEO_ORDER_FORM_URL,
        },
        400,
      );
    }

    if (error instanceof AryeoApiError) {
      console.error("Aryeo session request rejected", error.status);

      return json(
        {
          error: { code: "ARYEO_SESSION_FAILED", message: "Aryeo could not prepare the booking session." },
          fallbackUrl: ARYEO_ORDER_FORM_URL,
        },
        error.status >= 400 && error.status < 500 ? 502 : error.status,
      );
    }

    console.error(
      "Unexpected booking-session failure",
      error instanceof Error ? error.name : "Unknown non-error value",
    );

    return json(
      {
        error: { code: "BOOKING_SESSION_FAILED", message: "The booking session could not be prepared." },
        fallbackUrl: ARYEO_ORDER_FORM_URL,
      },
      500,
    );
  }
}

export default {
  fetch: handleBookingSession,
};
