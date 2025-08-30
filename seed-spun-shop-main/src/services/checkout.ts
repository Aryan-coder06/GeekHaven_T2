import { api } from "@/lib/api";

export async function checkout(
  items: { listingId: string; qty: number }[],
  subtotalPaise: number
) {
  const r = await api.post("/checkout", { items, subtotal: subtotalPaise });
  return { data: r.data, signature: r.headers["x-signature"] as string | undefined };
}
