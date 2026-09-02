import type { PackageId } from "./aryeoCatalog";

export type BookingCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type BookingAddress = {
  streetNumber: string;
  streetName: string;
  unitNumber?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country?: string;
};

export type BookingSelection = {
  packageId: PackageId;
  variantKey: string;
};

export type BookingSessionRequest = {
  customer: BookingCustomer;
  address: BookingAddress;
  selection: BookingSelection;
  companyWebsite?: string;
};

export type BookingSessionMode = "aryeo-session" | "direct-order-form" | "fallback";

export type BookingSessionResult = {
  bookingUrl: string;
  carriesCustomerDetails: boolean;
  carriesAddressDetails: boolean;
  mode: BookingSessionMode;
  notice?: string;
  selection: {
    packageName: string;
    variantLabel: string;
    price: number;
  };
};

export type BookingSessionErrorBody = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
  fallbackUrl?: string;
};
