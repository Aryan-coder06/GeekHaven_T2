import { api } from '@/lib/api';

const BASE = '/api/user';

export type SellerProfile = {
  shopName?: string;
  bio?: string;
  avatarUrl?: string;
  address?: string;
};

export type Me = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  address?: string;
  isSeller?: boolean;
  role?: 'USER' | 'SELLER' | 'ADMIN';
  sellerProfile?: SellerProfile;
};

function normalizeUser(payload: any): Me {
  const u = payload?.user ?? payload;
  if (!u) return payload;
  return {
    ...u,
    isSeller: u?.isSeller ?? (u?.role === 'SELLER' || u?.role === 'ADMIN'),
  };
}

export async function fetchMe() {
  const r = await api.get(`${BASE}/data`);
  return normalizeUser(r.data);
}

export async function updateMe(payload: Partial<Omit<Me, '_id' | 'email'>>) {
  const r = await api.patch(BASE, payload);
  return normalizeUser(r.data);
}

export async function becomeSeller(payload: SellerProfile) {
  const r = await api.post(`${BASE}/upgrade-seller`, payload);
  return normalizeUser(r.data);
}

export async function updateSellerProfile(payload: SellerProfile) {
  const r = await api.patch(`${BASE}/seller-profile`, payload);
  return normalizeUser(r.data);
}

// (optional, for “My Listings” later)
export async function fetchMyListings(params: { page?: number; limit?: number; sort?: string } = {}) {
  const r = await api.get(`${BASE}/my-listings`, { params });
  return r.data as { success: boolean; items: any[]; total: number; page: number; limit: number };
}
