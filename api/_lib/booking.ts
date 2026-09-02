import {
  ARYEO_ORDER_FORM_URL,
  PACKAGE_CONFIG,
  getCatalogVariant,
  isPackageId,
  type CatalogVariant,
  type PackageConfig,
} from "../../shared/aryeoCatalog.js";
import type { BookingSessionRequest } from "../../shared/bookingContract.js";

const ARYEO_API_BASE_URL = "https://api.aryeo.com/v1";
const CENSUS_GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder/locations/address";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UnknownRecord = Record<string, unknown>;

export type ValidatedBookingRequest = BookingSessionRequest & {
  packageConfig: PackageConfig;
  variant: CatalogVariant;
};

export type AryeoSessionPayload = {
  order_form_id: string;
  address_data?: {
    latitude: number;
    longitude: number;
    street_number: string;
    street_name: string;
    unit_number?: string;
    postal_code: string;
    city: string;
    state_or_province: string;
    country: string;
  };
  customer_data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  step_visibility: {
    show_address_step: true;
    show_customer_step: true;
  };
  success_url?: string;
};

export type AddressCoordinates = {
  latitude: number;
  longitude: number;
};

export class BookingValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super("Please correct the highlighted booking details.");
    this.name = "BookingValidationError";
    this.fields = fields;
  }
}

export class AryeoApiError extends Error {
  readonly status: number;
  readonly validationFields: string[];
  readonly responseKeys: string[];
  readonly responsePaths: string[];

  constructor(
    status: number,
    message: string,
    validationFields: string[] = [],
    responseKeys: string[] = [],
    responsePaths: string[] = [],
  ) {
    super(message);
    this.name = "AryeoApiError";
    this.status = status;
    this.validationFields = validationFields;
    this.responseKeys = responseKeys;
    this.responsePaths = responsePaths;
  }
}

const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null && !Array.isArray(value);

const cleanString = (value: unknown, maxLength: number) => (typeof value === "string" ? value.trim().slice(0, maxLength) : "");

const SAFE_DIAGNOSTIC_KEY_PATTERN = /^[a-z][a-z0-9_.\[\]-]{0,99}$/i;

function getSafeDiagnosticKeys(value: unknown): string[] {
  if (!isRecord(value)) return [];
  return Object.keys(value)
    .filter((key) => SAFE_DIAGNOSTIC_KEY_PATTERN.test(key))
    .slice(0, 20);
}

function getSafeDiagnosticPaths(value: unknown, prefix = "", depth = 0): string[] {
  if (depth > 3) return [];

  if (Array.isArray(value)) {
    return value.slice(0, 3).flatMap((item) => getSafeDiagnosticPaths(item, prefix, depth + 1)).slice(0, 40);
  }
  if (!isRecord(value)) return [];

  const paths = Object.entries(value).flatMap(([key, nestedValue]) => {
    if (!SAFE_DIAGNOSTIC_KEY_PATTERN.test(key)) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    return [path, ...getSafeDiagnosticPaths(nestedValue, path, depth + 1)];
  });

  return [...new Set(paths)].slice(0, 40);
}

function getAryeoValidationFields(value: unknown): string[] {
  if (!isRecord(value)) return [];

  const data = isRecord(value.data) ? value.data : {};
  const errors = value.errors ?? data.errors;
  if (isRecord(errors)) return getSafeDiagnosticKeys(errors);
  if (errors === undefined) return getSafeDiagnosticKeys(data);
  if (!Array.isArray(errors)) return [];

  const fields = errors.flatMap((item) => {
    if (!isRecord(item)) return [];

    const directField = typeof item.field === "string" ? item.field : typeof item.parameter === "string" ? item.parameter : "";
    const source = isRecord(item.source) ? item.source : {};
    const sourceField = typeof source.parameter === "string" ? source.parameter : typeof source.pointer === "string" ? source.pointer : "";
    const field = directField || sourceField.replace(/^\/data\/attributes\//, "").replaceAll("/", ".");

    return SAFE_DIAGNOSTIC_KEY_PATTERN.test(field) ? [field] : [];
  });

  return [...new Set(fields)].slice(0, 20);
}

export function validateBookingRequest(input: unknown): ValidatedBookingRequest {
  const body = isRecord(input) ? input : {};
  const customer = isRecord(body.customer) ? body.customer : {};
  const address = isRecord(body.address) ? body.address : {};
  const selection = isRecord(body.selection) ? body.selection : {};

  const normalized: BookingSessionRequest = {
    customer: {
      firstName: cleanString(customer.firstName, 100),
      lastName: cleanString(customer.lastName, 100),
      email: cleanString(customer.email, 254).toLowerCase(),
      phone: cleanString(customer.phone, 30),
    },
    address: {
      streetNumber: cleanString(address.streetNumber, 30),
      streetName: cleanString(address.streetName, 150),
      unitNumber: cleanString(address.unitNumber, 50) || undefined,
      city: cleanString(address.city, 100),
      stateOrProvince: cleanString(address.stateOrProvince, 100),
      postalCode: cleanString(address.postalCode, 20),
      country: cleanString(address.country, 2).toUpperCase() || "US",
    },
    selection: {
      packageId: selection.packageId as BookingSessionRequest["selection"]["packageId"],
      variantKey: cleanString(selection.variantKey, 100),
    },
    companyWebsite: cleanString(body.companyWebsite, 255) || undefined,
  };

  const fields: Record<string, string> = {};
  if (!normalized.customer.firstName) fields.firstName = "Enter a first name.";
  if (!normalized.customer.lastName) fields.lastName = "Enter a last name.";
  if (!EMAIL_PATTERN.test(normalized.customer.email)) fields.email = "Enter a valid email address.";
  if (normalized.customer.phone.replace(/\D/g, "").length < 7) fields.phone = "Enter a valid phone number.";
  if (!normalized.address.streetNumber) fields.streetNumber = "Enter the street number.";
  if (!normalized.address.streetName) fields.streetName = "Enter the street name.";
  if (!normalized.address.city) fields.city = "Enter the city.";
  if (!normalized.address.stateOrProvince) fields.stateOrProvince = "Enter the state or province.";
  if (normalized.address.postalCode.length < 3) fields.postalCode = "Enter a valid postal code.";
  if (normalized.address.country?.length !== 2) fields.country = "Use a two-letter country code.";
  if (!isPackageId(normalized.selection.packageId)) fields.packageId = "Choose a valid package.";

  const packageConfig = isPackageId(normalized.selection.packageId)
    ? PACKAGE_CONFIG.packages[normalized.selection.packageId]
    : PACKAGE_CONFIG.packages.essentials;
  const selectedVariant = isPackageId(normalized.selection.packageId)
    ? getCatalogVariant(normalized.selection.packageId, normalized.selection.variantKey)
    : undefined;
  if (!selectedVariant) fields.variantKey = "Choose a valid package option.";

  if (Object.keys(fields).length > 0) throw new BookingValidationError(fields);

  return {
    ...normalized,
    packageConfig,
    variant: selectedVariant as CatalogVariant,
  };
}

export function buildAryeoSessionPayload(
  request: ValidatedBookingRequest,
  orderFormId: string,
  coordinates: AddressCoordinates | null,
  successUrl?: string,
): AryeoSessionPayload {
  if (!UUID_PATTERN.test(orderFormId)) throw new Error("ARYEO_ORDER_FORM_ID must be a valid UUID.");

  const payload: AryeoSessionPayload = {
    order_form_id: orderFormId,
    ...(coordinates
      ? {
          address_data: {
            ...coordinates,
            street_number: request.address.streetNumber,
            street_name: request.address.streetName,
            ...(request.address.unitNumber ? { unit_number: request.address.unitNumber } : {}),
            postal_code: request.address.postalCode,
            city: request.address.city,
            state_or_province: request.address.stateOrProvince,
            country: request.address.country || "US",
          },
        }
      : {}),
    customer_data: {
      email: request.customer.email,
      first_name: request.customer.firstName,
      last_name: request.customer.lastName,
      phone: request.customer.phone,
    },
    // The production form has address-level custom fields, territory checks, and a
    // contact review step. Keep both visible even when the core values are prefilled.
    step_visibility: {
      show_address_step: true,
      show_customer_step: true,
    },
  };

  if (successUrl) {
    const parsedSuccessUrl = new URL(successUrl);
    if (parsedSuccessUrl.protocol !== "https:") throw new Error("ARYEO_SUCCESS_URL must use HTTPS.");
    payload.success_url = parsedSuccessUrl.toString();
  }

  return payload;
}

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export async function geocodeBookingAddress(
  address: ValidatedBookingRequest["address"],
  fetchImpl: FetchLike = fetch,
): Promise<AddressCoordinates | null> {
  if ((address.country || "US") !== "US") return null;

  const url = new URL(CENSUS_GEOCODER_URL);
  url.search = new URLSearchParams({
    street: `${address.streetNumber} ${address.streetName}`,
    city: address.city,
    state: address.stateOrProvince,
    zip: address.postalCode,
    benchmark: "Public_AR_Current",
    format: "json",
  }).toString();

  try {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "NoWallsPricingPrototype/0.1",
      },
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) return null;

    const responseBody: unknown = await response.json();
    const result = isRecord(responseBody) && isRecord(responseBody.result) ? responseBody.result : null;
    const matches = result && Array.isArray(result.addressMatches) ? result.addressMatches : [];
    const firstMatch = isRecord(matches[0]) ? matches[0] : null;
    const coordinates = firstMatch && isRecord(firstMatch.coordinates) ? firstMatch.coordinates : null;
    const longitude = coordinates?.x;
    const latitude = coordinates?.y;

    if (
      typeof latitude !== "number"
      || !Number.isFinite(latitude)
      || latitude < -90
      || latitude > 90
      || typeof longitude !== "number"
      || !Number.isFinite(longitude)
      || longitude < -180
      || longitude > 180
    ) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
}

export async function createAryeoOrderFormSession(
  apiKey: string,
  payload: AryeoSessionPayload,
  fetchImpl: FetchLike = fetch,
): Promise<string> {
  const normalizedApiKey = apiKey.replace(/\s+/g, "");
  if (!normalizedApiKey) throw new Error("ARYEO_API_KEY is empty after normalization.");

  const response = await fetchImpl(`${ARYEO_API_BASE_URL}/order-form-sessions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${normalizedApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    throw new AryeoApiError(
      response.status,
      `Aryeo rejected the session request with status ${response.status}.`,
      getAryeoValidationFields(responseBody),
      getSafeDiagnosticKeys(responseBody),
      getSafeDiagnosticPaths(responseBody),
    );
  }

  const data = isRecord(responseBody) && isRecord(responseBody.data) ? responseBody.data : null;
  const sessionUrl = data && typeof data.url === "string" ? data.url : "";
  if (!isTrustedNoWallsAryeoUrl(sessionUrl)) {
    throw new AryeoApiError(502, "Aryeo returned an invalid booking URL.");
  }

  return sessionUrl;
}

export function isTrustedNoWallsAryeoUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "nowalls.aryeo.com" && url.pathname.startsWith("/order-form");
  } catch {
    return false;
  }
}

export function buildDirectHandoff(request: ValidatedBookingRequest) {
  return {
    bookingUrl: ARYEO_ORDER_FORM_URL,
    carriesCustomerDetails: false,
    carriesAddressDetails: false,
    mode: "direct-order-form" as const,
    notice: "Your package recommendation is ready, but your contact and address details will need to be entered again in Aryeo.",
    selection: {
      packageName: request.packageConfig.name,
      variantLabel: request.variant.label,
      price: request.variant.price,
    },
  };
}
