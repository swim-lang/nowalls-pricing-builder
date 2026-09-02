import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "nowalls-aryeo-integration-"));
const serverBundlePath = path.join(tempDirectory, "booking-server.mjs");
const endpointBundlePath = path.join(tempDirectory, "booking-endpoint.mjs");
const clientBundlePath = path.join(tempDirectory, "booking-client.js");

const validInput = {
  customer: {
    firstName: "Avery",
    lastName: "Agent",
    email: "AVERY@example.com ",
    phone: "(720) 555-0100",
  },
  address: {
    streetNumber: "123",
    streetName: "Main Street",
    unitNumber: "Suite 2",
    city: "Denver",
    stateOrProvince: "CO",
    postalCode: "80202",
    country: "us",
  },
  selection: {
    packageId: "essentials",
    variantKey: "vertical-reel",
  },
};

try {
  await build({
    entryPoints: ["api/_lib/booking.ts"],
    bundle: true,
    outfile: serverBundlePath,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });

  const {
    BookingValidationError,
    buildAryeoSessionPayload,
    createAryeoOrderFormSession,
    validateBookingRequest,
  } = await import(pathToFileURL(serverBundlePath).href);

  const validated = validateBookingRequest(validInput);
  assert.equal(validated.customer.email, "avery@example.com");
  assert.equal(validated.address.country, "US");
  assert.equal(validated.packageConfig.aryeoProductTitle, "Essentials Package");
  assert.equal(validated.variant.label, "With Vertical Reel");
  assert.equal(validated.variant.price, 495);

  const payload = buildAryeoSessionPayload(
    validated,
    "019cabc9-1539-7102-892e-6368f97d965b",
    "https://example.com/booking-complete",
  );
  assert.deepEqual(payload.customer_data, {
    email: "avery@example.com",
    first_name: "Avery",
    last_name: "Agent",
    phone: "(720) 555-0100",
  });
  assert.deepEqual(payload.address_data, {
    street_number: "123",
    street_name: "Main Street",
    unit_number: "Suite 2",
    postal_code: "80202",
    city: "Denver",
    state_or_province: "CO",
    country: "US",
  });
  assert.deepEqual(payload.step_visibility, { show_address_step: true, show_customer_step: true });
  assert.equal("selection" in payload, false, "Unsupported product selection must not be sent to Aryeo sessions");

  let capturedRequest;
  const mockFetch = async (url, init) => {
    capturedRequest = { url: String(url), init };
    return Response.json(
      { data: { url: "https://nowalls.aryeo.com/order-form-sessions/00000000-0000-4000-8000-000000000001" } },
      { status: 201 },
    );
  };
  const sessionUrl = await createAryeoOrderFormSession(" unit-test-\n token ", payload, mockFetch);
  assert.equal(sessionUrl, "https://nowalls.aryeo.com/order-form-sessions/00000000-0000-4000-8000-000000000001");
  assert.equal(capturedRequest.url, "https://api.aryeo.com/v1/order-form-sessions");
  assert.equal(capturedRequest.init.method, "POST");
  assert.equal(capturedRequest.init.headers.Authorization, "Bearer unit-test-token");
  assert.deepEqual(JSON.parse(capturedRequest.init.body), payload);

  await assert.rejects(
    () => createAryeoOrderFormSession("unit-test-token", payload, async () => Response.json(
      {
        status: "fail",
        message: "The given data was invalid.",
        errors: {
          order_form_id: ["A sensitive upstream validation message."],
          "customer_data.email": ["A sensitive upstream validation message."],
        },
      },
      { status: 422 },
    )),
    (error) => {
      assert.equal(error.status, 422);
      assert.deepEqual(error.validationFields, ["order_form_id", "customer_data.email"]);
      assert.deepEqual(error.responseKeys, ["status", "message", "errors"]);
      assert.deepEqual(error.responsePaths, [
        "status",
        "message",
        "errors",
        "errors.order_form_id",
        "errors.customer_data.email",
      ]);
      assert.equal(error.message.includes("sensitive"), false);
      return true;
    },
  );

  await assert.rejects(
    () => createAryeoOrderFormSession("unit-test-token", payload, async () => Response.json(
      {
        status: "fail",
        timestamp: "2026-09-02T00:00:00Z",
        data: {
          errors: {
            "address_data.street_name": ["A sensitive upstream validation message."],
          },
        },
      },
      { status: 422 },
    )),
    (error) => {
      assert.deepEqual(error.validationFields, ["address_data.street_name"]);
      assert.deepEqual(error.responsePaths, [
        "status",
        "timestamp",
        "data",
        "data.errors",
        "data.errors.address_data.street_name",
      ]);
      return true;
    },
  );

  assert.throws(
    () => validateBookingRequest({ ...validInput, selection: { packageId: "essentials", variantKey: "made-up-option" } }),
    (error) => Boolean(error instanceof BookingValidationError && error.fields.variantKey),
  );
  assert.throws(
    () => validateBookingRequest({ ...validInput, customer: { ...validInput.customer, email: "not-an-email" } }),
    (error) => Boolean(error instanceof BookingValidationError && error.fields.email),
  );
  assert.throws(
    () => buildAryeoSessionPayload(validated, "not-a-uuid"),
    /valid UUID/,
  );

  await build({
    entryPoints: ["api/booking-session.ts"],
    bundle: true,
    outfile: endpointBundlePath,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  const endpoint = (await import(pathToFileURL(endpointBundlePath).href)).default;
  process.env.ARYEO_BOOKING_ENABLED = "false";
  delete process.env.ARYEO_API_KEY;

  const directResponse = await endpoint.fetch(new Request("https://example.com/api/booking-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validInput),
  }));
  const directBody = await directResponse.json();
  assert.equal(directResponse.status, 200);
  assert.equal(directBody.mode, "direct-order-form");
  assert.equal(directBody.carriesCustomerDetails, false);
  assert.match(directBody.bookingUrl, /^https:\/\/nowalls\.aryeo\.com\/order-forms\//);

  process.env.ARYEO_BOOKING_ENABLED = "true";
  const unconfiguredResponse = await endpoint.fetch(new Request("https://example.com/api/booking-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validInput),
  }));
  assert.equal(unconfiguredResponse.status, 503);
  assert.equal((await unconfiguredResponse.json()).error.code, "ARYEO_NOT_CONFIGURED");

  await build({
    entryPoints: ["src/main.tsx"],
    bundle: true,
    outfile: clientBundlePath,
    format: "esm",
    platform: "browser",
    logLevel: "silent",
    loader: { ".css": "empty" },
  });
  const clientBundle = await readFile(clientBundlePath, "utf8");
  assert.equal(clientBundle.includes("ARYEO_API_KEY"), false, "The server credential name leaked into the browser bundle");
  assert.equal(clientBundle.includes("api.aryeo.com/v1"), false, "The private Aryeo API target leaked into the browser bundle");

  console.log("Aryeo request validation, payload mapping, API call, and browser secret boundary verified.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
