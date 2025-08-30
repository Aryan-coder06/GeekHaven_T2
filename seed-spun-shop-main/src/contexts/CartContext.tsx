// import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// import { calculatePlatformFee, formatCurrency } from '@/utils/seed';
// import { useAuth } from '@/contexts/AuthContext';
// import { getCart, addToCart, updateCartItem, removeFromCart, clearRemoteCart, syncCart } from '@/services/cart';

// export interface CartItem {
//   id: string;       // UI id (checksum or raw). In server mode we use raw _id.
//   idRaw?: string;   // Mongo _id (prefer this when calling APIs)
//   title: string;
//   price: number;    // RUPEES in frontend state (server returns paise -> we convert)
//   image: string;
//   sellerId: string;
//   sellerName: string;
//   quantity: number;
// }

// interface CartState {
//   items: CartItem[];
//   subtotal: number;     // RUPEES
//   platformFee: number;  // RUPEES
//   total: number;        // RUPEES
// }

// type CartAction =
//   | { type: 'SET_ALL'; items: CartItem[] }
//   | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
//   | { type: 'REMOVE_ITEM'; id: string }
//   | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
//   | { type: 'CLEAR_CART' };

// const initialState: CartState = {
//   items: [],
//   subtotal: 0,
//   platformFee: 0,
//   total: 0,
// };

// function recompute(items: CartItem[]): CartState {
//   const subtotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
//   const platformFee = calculatePlatformFee(subtotal);
//   const total = subtotal + platformFee;
//   return { items, subtotal, platformFee, total };
// }

// function cartReducer(state: CartState, action: CartAction): CartState {
//   switch (action.type) {
//     case 'SET_ALL': {
//       return recompute(action.items);
//     }
//     case 'ADD_ITEM': {
//       const existing = state.items.find(i => i.id === action.item.id);
//       const items = existing
//         ? state.items.map(i => (i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i))
//         : [...state.items, { ...action.item, quantity: 1 }];
//       return recompute(items);
//     }
//     case 'REMOVE_ITEM': {
//       const items = state.items.filter(i => i.id !== action.id);
//       return recompute(items);
//     }
//     case 'UPDATE_QUANTITY': {
//       const items = action.quantity <= 0
//         ? state.items.filter(i => i.id !== action.id)
//         : state.items.map(i => (i.id === action.id ? { ...i, quantity: action.quantity } : i));
//       return recompute(items);
//     }
//     case 'CLEAR_CART': {
//       return recompute([]);
//     }
//     default:
//       return state;
//   }
// }

// interface CartContextType extends CartState {
//   addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void> | void;
//   removeItem: (id: string) => Promise<void> | void;
//   updateQuantity: (id: string, quantity: number) => Promise<void> | void;
//   clearCart: () => Promise<void> | void;
//   itemCount: number;
//   formattedSubtotal: string;
//   formattedPlatformFee: string;
//   formattedTotal: string;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// const LS_KEY = 'marketplace-cart';

// // Map backend (populated) items -> CartItem[]
// function mapServerItems(serverItems: any[]): CartItem[] {
//   return (serverItems || []).map((it: any) => {
//     const L = it?.listingId; // populated listing doc
//     const pricePaise = typeof L?.price === 'number' ? L.price : 0;
//     const seller = L?.sellerId;
//     return {
//       id: L?._id || '',       // use raw id in server mode
//       idRaw: L?._id,
//       title: L?.title || 'Item',
//       price: pricePaise / 100,              // RUPEES in UI
//       image: L?.images?.[0] || '',
//       sellerId: (seller?._id || seller || '').toString?.() || '',
//       sellerName: seller?.sellerProfile?.shopName || seller?.name || 'Seller',
//       quantity: Number(it?.qty || 1),
//     };
//   });
// }

// export function CartProvider({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   const isAuthed = !!user;

//   const [state, dispatch] = useReducer(cartReducer, initialState);

//   // Load cart: Local for guests; Server for authed users (with local->server sync)
//   useEffect(() => {
//     (async () => {
//       if (!isAuthed) {
//         // Guest mode: hydrate from localStorage (same behavior you had)
//         const saved = localStorage.getItem(LS_KEY);
//         if (saved) {
//           try {
//             const parsed = JSON.parse(saved) as CartState;
//             const items = Array.isArray(parsed?.items) ? parsed.items : [];
//             // Ensure sane numbers
//             const safeItems = items.map(it => ({
//               ...it,
//               price: Number(it.price) || 0,
//               quantity: Number(it.quantity) || 1,
//             }));
//             dispatch({ type: 'SET_ALL', items: safeItems });
//           } catch (e) {
//             console.warn('Failed to parse local cart', e);
//           }
//         } else {
//           dispatch({ type: 'SET_ALL', items: [] });
//         }
//       } else {
//         // Authed mode: sync local -> server once, then load server
//         try {
//           const saved = localStorage.getItem(LS_KEY);
//           if (saved) {
//             try {
//               const parsed = JSON.parse(saved) as CartState;
//               const localItems = Array.isArray(parsed?.items) ? parsed.items : [];
//               const payload = localItems
//                 .filter(it => it && (it.idRaw || it.id))
//                 .map(it => ({
//                   listingId: it.idRaw ?? (it.id.includes('-') ? it.id.split('-')[0] : it.id),
//                   qty: Number(it.quantity || 1),
//                 }));
//               if (payload.length) {
//                 await syncCart(payload);
//               }
//               localStorage.removeItem(LS_KEY);
//             } catch (e) {
//               console.warn('Failed to sync local cart to server', e);
//             }
//           }
//           const srv = await getCart();
//           dispatch({ type: 'SET_ALL', items: mapServerItems(srv.items) });
//         } catch (e) {
//           console.error('Failed to load server cart', e);
//           dispatch({ type: 'SET_ALL', items: [] });
//         }
//       }
//     })();
//   }, [isAuthed]);

//   // Persist guest cart to localStorage
//   useEffect(() => {
//     if (!isAuthed) {
//       try {
//         localStorage.setItem(LS_KEY, JSON.stringify(state));
//       } catch (e) {
//         console.warn('Failed to persist cart to localStorage', e);
//       }
//     }
//   }, [state, isAuthed]);

//   // Actions: switch behavior by auth status
//   const reloadServer = useCallback(async () => {
//     try {
//       const srv = await getCart();
//       dispatch({ type: 'SET_ALL', items: mapServerItems(srv.items) });
//     } catch (e) {
//       console.error('Failed to reload server cart', e);
//     }
//   }, []);

//   const addItem: CartContextType['addItem'] = async (item) => {
//     if (!isAuthed) {
//       dispatch({ type: 'ADD_ITEM', item });
//       return;
//     }
//     const realId = item.idRaw ?? (item.id.includes('-') ? item.id.split('-')[0] : item.id);
//     await addToCart(realId, 1);
//     await reloadServer();
//   };

//   const removeItem: CartContextType['removeItem'] = async (id) => {
//     if (!isAuthed) {
//       dispatch({ type: 'REMOVE_ITEM', id });
//       return;
//     }
//     const realId = id.includes('-') ? id.split('-')[0] : id;
//     await removeFromCart(realId);
//     await reloadServer();
//   };

//   const updateQuantity: CartContextType['updateQuantity'] = async (id, quantity) => {
//     if (!isAuthed) {
//       dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
//       return;
//     }
//     const realId = id.includes('-') ? id.split('-')[0] : id;
//     await updateCartItem(realId, quantity);
//     await reloadServer();
//   };

//   const clearCart: CartContextType['clearCart'] = async () => {
//     if (!isAuthed) {
//       dispatch({ type: 'CLEAR_CART' });
//       return;
//     }
//     await clearRemoteCart();
//     await reloadServer();
//   };

//   const itemCount = state.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

//   return (
//     <CartContext.Provider
//       value={{
//         ...state,
//         addItem,
//         removeItem,
//         updateQuantity,
//         clearCart,
//         itemCount,
//         formattedSubtotal: formatCurrency(state.subtotal),
//         formattedPlatformFee: formatCurrency(state.platformFee),
//         formattedTotal: formatCurrency(state.total),
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error('useCart must be used within a CartProvider');
//   return ctx;
// }



import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { calculatePlatformFee, formatCurrency } from '@/utils/seed';
import { useAuth } from '@/contexts/AuthContext';
import { getCart, addToCart, updateCartItem, removeFromCart, clearRemoteCart, syncCart } from '@/services/cart';

export interface CartItem {
  id: string;       // UI id (checksum or raw). In server mode we store raw _id here.
  idRaw?: string;   // Mongo _id (prefer this when calling APIs)
  title: string;
  price: number;    // RUPEES in frontend state (server returns paise -> we convert)
  image: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;     // RUPEES
  platformFee: number;  // RUPEES
  total: number;        // RUPEES
}

type CartAction =
  | { type: 'SET_ALL'; items: CartItem[] }
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  subtotal: 0,
  platformFee: 0,
  total: 0,
};

const LS_KEY = 'marketplace-cart';

function recompute(items: CartItem[]): CartState {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;
  return { items, subtotal, platformFee, total };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ALL': {
      return recompute(action.items);
    }
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id);
      const items = existing
        ? state.items.map(i => (i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...state.items, { ...action.item, quantity: 1 }];
      return recompute(items);
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.id);
      return recompute(items);
    }
    case 'UPDATE_QUANTITY': {
      const items = action.quantity <= 0
        ? state.items.filter(i => i.id !== action.id)
        : state.items.map(i => (i.id === action.id ? { ...i, quantity: action.quantity } : i));
      return recompute(items);
    }
    case 'CLEAR_CART': {
      return recompute([]);
    }
    default:
      return state;
  }
}

// ---------- utils ----------
const hasWindow = typeof window !== 'undefined';

function readLocalCart(): CartState | null {
  try {
    if (!hasWindow) return null;
    const saved = window.localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function writeLocalCart(state: CartState) {
  try {
    if (!hasWindow) return;
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// Always send raw Mongo _id to backend; fall back to stripping checksum
function getRealId(id?: string, idRaw?: string): string | null {
  if (idRaw && typeof idRaw === 'string') return idRaw;
  if (!id) return null;
  return id.includes('-') ? id.split('-')[0] : id;
}

// Map backend (populated) items -> CartItem[]
function mapServerItems(serverItems: any[]): CartItem[] {
  return (serverItems || []).map((it: any) => {
    const L = it?.listingId; // populated listing doc
    const pricePaise = typeof L?.price === 'number' ? L.price : 0;
    const seller = L?.sellerId;
    const sellerIdRaw = (seller?._id ?? seller ?? '').toString?.() || '';
    return {
      id: L?._id || '',                 // store RAW id in server mode
      idRaw: L?._id,
      title: L?.title || 'Item',
      price: pricePaise / 100,          // RUPEES in UI
      image: L?.images?.[0] || '',
      sellerId: sellerIdRaw,
      sellerName: seller?.sellerProfile?.shopName || seller?.name || 'Seller',
      quantity: Number(it?.qty || 1),
    };
  });
}

// ---------- context ----------
interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, quantity: number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  itemCount: number;
  formattedSubtotal: string;
  formattedPlatformFee: string;
  formattedTotal: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAuthed = !!user;

  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart: Local for guests; Server for authed users (with local->server sync)
  useEffect(() => {
    (async () => {
      if (!isAuthed) {
        const parsed = readLocalCart();
        const items = Array.isArray(parsed?.items) ? parsed!.items : [];
        const safeItems = items.map(it => ({
          ...it,
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
        }));
        dispatch({ type: 'SET_ALL', items: safeItems });
      } else {
        try {
          // sync local -> server once
          const parsed = readLocalCart();
          const localItems = Array.isArray(parsed?.items) ? parsed!.items : [];
          const payload = localItems
            .filter(it => it && (it.idRaw || it.id))
            .map(it => {
              const realId = getRealId(it.id, it.idRaw);
              return realId ? { listingId: realId, qty: Number(it.quantity || 1) } : null;
            })
            .filter(Boolean) as { listingId: string; qty: number }[];
          if (payload.length) {
            try { await syncCart(payload); } catch (e) { console.warn('syncCart failed', e); }
          }
          // clear local after sync (best-effort)
          writeLocalCart(initialState);

          const srv = await getCart();
          dispatch({ type: 'SET_ALL', items: mapServerItems(srv.items) });
        } catch (e) {
          console.error('Failed to load server cart', e);
          dispatch({ type: 'SET_ALL', items: [] });
        }
      }
    })();
  }, [isAuthed]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isAuthed) writeLocalCart(state);
  }, [state, isAuthed]);

  // Actions: switch behavior by auth status
  const reloadServer = useCallback(async () => {
    try {
      const srv = await getCart();
      dispatch({ type: 'SET_ALL', items: mapServerItems(srv.items) });
    } catch (e) {
      console.error('Failed to reload server cart', e);
    }
  }, []);

  const addItem: CartContextType['addItem'] = async (item) => {
    if (!isAuthed) {
      dispatch({ type: 'ADD_ITEM', item });
      return;
    }
    const realId = getRealId(item.id, item.idRaw);
    if (!realId) {
      console.warn('No raw listing id available for addToCart', item);
      return;
    }
    try {
      await addToCart(realId, 1);
      await reloadServer();
    } catch (e) {
      console.error('addToCart failed', e);
    }
  };

  const removeItem: CartContextType['removeItem'] = async (id) => {
    if (!isAuthed) {
      dispatch({ type: 'REMOVE_ITEM', id });
      return;
    }
    const realId = getRealId(id);
    if (!realId) return;
    try {
      await removeFromCart(realId);
      await reloadServer();
    } catch (e) {
      console.error('removeFromCart failed', e);
    }
  };

  const updateQuantity: CartContextType['updateQuantity'] = async (id, quantity) => {
    if (!isAuthed) {
      dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
      return;
    }
    const realId = getRealId(id);
    if (!realId) return;
    try {
      await updateCartItem(realId, quantity);
      await reloadServer();
    } catch (e) {
      console.error('updateCartItem failed', e);
    }
  };

  const clearCart: CartContextType['clearCart'] = async () => {
    if (!isAuthed) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    try {
      await clearRemoteCart();
      await reloadServer();
    } catch (e) {
      console.error('clearRemoteCart failed', e);
    }
  };

  const itemCount = state.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        formattedSubtotal: formatCurrency(state.subtotal),
        formattedPlatformFee: formatCurrency(state.platformFee),
        formattedTotal: formatCurrency(state.total),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
