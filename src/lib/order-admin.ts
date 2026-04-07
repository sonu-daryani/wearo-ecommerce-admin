import type { OrderPaymentStatus, OrderStatus } from "@prisma/client";

export type AdminOrderLine = {
  id: number;
  name: string;
  srcUrl: string;
  price: number;
  quantity: number;
  attributes: string[];
  discount: { percentage: number; amount: number };
};

export type AdminOrderShipping = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pin: string;
};

export function parseOrderItems(raw: unknown): AdminOrderLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isOrderLine);
}

function isOrderLine(x: unknown): x is AdminOrderLine {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.quantity === "number"
  );
}

export function parseOrderShipping(raw: unknown): AdminOrderShipping | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const fields = ["fullName", "email", "phone", "address", "city", "pin"] as const;
  for (const k of fields) {
    if (typeof o[k] !== "string") return null;
  }
  return {
    fullName: o.fullName as string,
    email: o.email as string,
    phone: o.phone as string,
    address: o.address as string,
    city: o.city as string,
    pin: o.pin as string,
  };
}

export function formatMoney(amount: number, currencyCode: string, locale = "en-IN"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<OrderPaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  AWAITING_COD: "COD — awaiting collection",
};
