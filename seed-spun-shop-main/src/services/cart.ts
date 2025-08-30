import { api } from "@/lib/api";

export async function getCart() {
  const r = await api.get("/cart");
  return r.data as { items: any[]; subtotal: number }; 
}

export async function addToCart(listingId: string, qty = 1) {
  const r = await api.post("/cart", { listingId, qty });
  return r.data;
}

export async function updateCartItem(listingId: string, qty: number) {
  const r = await api.patch(`/cart/${listingId}`, { qty });
  return r.data;
}

export async function removeFromCart(listingId: string) {
  const r = await api.delete(`/cart/${listingId}`);
  return r.data;
}

export async function clearRemoteCart() {
  const r = await api.delete("/cart");
  return r.data;
}

export async function syncCart(items: { listingId: string; qty: number }[]) {
  const r = await api.post("/cart/sync", { items });
  return r.data;
}
