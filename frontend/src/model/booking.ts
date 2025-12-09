import { Application } from "./application";
import { Payment, PaymentStatus } from "./payment";
import { User } from "./user";

type SimpleUser = Omit<User, "userBioAttributes">;

export interface Booking {
  id?: string;
  host?: SimpleUser;
  tenant?: SimpleUser;
  application?: Application;
  paymentFromTenant?: Payment;
  paymentToHost?: Payment;
}

type BookingColumns = {
  bookingId?: string;
  paymentAmount?: number;
  paymentStatus?: PaymentStatus;
  address?: string;
  from?: string;
  to?: string;
  listingId?: string;
  listingPictureUrl?: string;
  listingName?: string;
  applicationId?: string;
};

export type TenantBookingColumns = BookingColumns & {
  hostEmail?: string;
  hostName?: string;
  hostPhoneNumber?: string;
};

export type HostBookingColumns = BookingColumns & {
  tenantEmail?: string;
  tenantName?: string;
  tenantPhoneNumber?: string;
  paymentStatusToHost?: PaymentStatus;
  paymentAmountToHost?: number;
};
