import { api } from '@/lib/api';

export async function getFavorites() {
  const r = await api.get('/favorites');      // user inferred from cookie
  return r.data.favorites;
}

export async function addFavorite(listingId: string) {
  const r = await api.post(`/favorites/${listingId}`); // no userId needed
  return r.data;
}

export async function removeFavorite(listingId: string) {
  const r = await api.delete(`/favorites/${listingId}`); // no userId needed
  return r.data;
}
