export enum PaymentStatus {
  Requested = "REQUESTED",
  Refused = "REFUSED",
  Settled = "SETTLED",
  Pending = "PENDING",
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  total: number;
  paymentRequestCreated: Date;
}
