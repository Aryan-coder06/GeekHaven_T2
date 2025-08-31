import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('marketplace-auth');
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        config.headers.Authorization = `Bearer ${authData.token}`;
      } catch (error) {
        console.warn('Failed to parse auth data:', error);
      }
    }

    if (config.method === 'post') {
      config.headers['Idempotency-Key'] = uuidv4();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const signature = response.headers['x-signature'];
    if (signature) {
      console.log('API Signature:', signature);
      sessionStorage.setItem('last-api-signature', signature);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
      localStorage.removeItem('marketplace-auth');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Handle rate limiting with retry suggestion
      console.warn('Rate limited. Please retry in a moment.');
    }

    return Promise.reject(error);
  }
);

export interface Product {
  id: string;
  sku:string;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  location: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  createdAt: Date;
  views: number;
  likes: number;
  isLiked?: boolean;
  priceHistory?: { date: Date; price: number }[];
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewCount: number;
  joinedDate: Date;
  location: string;
  responseTime: string;
  listings: Product[];
}

export interface CheckoutRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  platformFee: number;
  total: number;
}

export interface CheckoutResponse {
  orderId: string;
  platformFee: number;
  nFromSeed: number;
  chargedTotal: number;
  signature: string;
}

// API functions
export const productsApi = {
  getProducts: async (page = 1, limit = 10, search?: string, category?: string, filters?: any): Promise<{ products: Product[]; total: number }> => {
    
    const mockProducts = generateMockProducts();
    
    let filteredProducts = mockProducts;
    
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (filters?.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters?.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
    }

    if (filters?.condition) {
      filteredProducts = filteredProducts.filter(p => p.condition === filters.condition);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
    };
  },

  getProduct: async (id: string): Promise<Product> => {
    const products = generateMockProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  likeProduct: async (id: string): Promise<void> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  getSeller: async (id: string): Promise<Seller> => {
    return generateMockSeller(id);
  },

  checkout: async (request: CheckoutRequest): Promise<CheckoutResponse> => {

    const response = await api.post('/checkout', request);
    
    const mockResponse: CheckoutResponse = {
      orderId: `order-${Date.now()}`,
      platformFee: request.platformFee,
      nFromSeed: 25, // From FRONT25
      chargedTotal: request.total,
      signature: `sig-${Math.random().toString(36).substr(2, 9)}`,
    };

    sessionStorage.setItem('checkout-signature', mockResponse.signature);
    
    return mockResponse;
  },
};

function generateMockProducts(): Product[] {
  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Collectibles'];
  const conditions: Product['condition'][] = ['New', 'Like New', 'Good', 'Fair'];
  const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];

  return Array.from({ length: 50 }, (_, i) => {
    const categoryCode = categories[Math.floor(Math.random() * categories.length)].substring(0, 3).toUpperCase();
    const sku = `${categoryCode}-${String(i + 1).padStart(4, '0')}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    return {
      id: `product-${i + 1}`,
      sku,
      title: `Amazing Item ${i + 1}`,
      price: Math.floor(Math.random() * 500) + 10,
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=400&fit=crop`,
      description: `This is a fantastic item perfect for anyone looking for quality and value. Item ${i + 1} comes with everything you need.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      sellerId: `seller-${Math.floor(Math.random() * 10) + 1}`,
      sellerName: `Seller ${Math.floor(Math.random() * 10) + 1}`,
      sellerRating: 3.5 + Math.random() * 1.5,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      isLiked: Math.random() > 0.7,
      priceHistory: Array.from({ length: 7 }, (_, j) => ({
        date: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
        price: Math.floor(Math.random() * 500) + 10,
      })),
    };
  });
}


function generateMockSeller(id: string): Seller {
  return {
    id,
    name: `Seller ${id}`,
    avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
    bio: 'Passionate seller with years of experience in online marketplace.',
    rating: 4.2 + Math.random() * 0.8,
    reviewCount: Math.floor(Math.random() * 200) + 10,
    joinedDate: new Date('2022-01-01'),
    location: 'Los Angeles, CA',
    responseTime: 'Usually responds within 2 hours',
    listings: [],
  };
}