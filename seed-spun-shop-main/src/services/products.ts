 import { api } from "@/lib/api";

 export type Listing = {
   _id: string;
   title: string;
   description: string;
   price: number;           
   category: string;
   location?: string;
   images: string[];
   sellerId: {
     _id: string;
     name: string;
     avatar?: string;
    sellerProfile?: {
      shopName?: string;
      bio?: string;
      avatarUrl?: string;
      address?: string;
    };
     rating?: number;
   };
  isFeatured?: boolean;
  sku?: string;
  createdAt: string;
  updatedAt?: string;
};

type ListResponse = { items: Listing[]; total: number; page: number; limit: number };

export async function fetchListings(params: {
   page?: number; limit?: number; search?: string; category?: string;
   min?: number; max?: number; sort?: string; location? : string;
 } = {}) {
  const r = await api.get<ListResponse>("/listings", { params });
  return r.data;
 }

 export async function fetchListing(id: string) {
  const r = await api.get<Listing>(`/listings/${id}`);
  return r.data;
 }
