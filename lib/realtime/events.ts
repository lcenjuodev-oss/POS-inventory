export type RealtimeEvent =
  | "invoice_added"
  | "product_updated"
  | "stock_changed";

export interface RealtimePayload<T = unknown> {
  event: RealtimeEvent;
  data: T;
}


