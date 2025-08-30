import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { useLog } from '@/contexts/LogContext';
import { useToast } from '@/hooks/use-toast';
import { getFavorites, removeFavorite } from '@/services/favorites';
import { fetchListing } from '@/services/products';
import { generateProductId } from '@/utils/seed';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';

import type { Listing } from '@/services/products';
type FavoriteRef = { listingId?: string };


const isListing = (v: unknown): v is Listing =>
  !!v && typeof v === 'object' && '_id' in (v as any) && 'title' in (v as any);


export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { seed } = useSeedTheme();
  const { addLog } = useLog();
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);


  const loadFavorites = async () => {
     try {
      setLoading(true);
      const favs = (await getFavorites()) as Array<Listing | FavoriteRef>;

      let listings: Listing[] = [];
      if (Array.isArray(favs) && favs.length > 0 && isListing(favs[0])) {
        listings = favs as Listing[];
      } else {
        const ids = (favs || []).map((f: any) => f.listingId).filter(Boolean);
        const results = await Promise.allSettled(ids.map((id: string) => fetchListing(id)));
        listings = results
          .filter(r => r.status === 'fulfilled')
          .map((r: any) => r.value as Listing);
      }

      const mapped = listings.map((x) => ({
        id: generateProductId(x._id, seed),  // UI checksum id
        idRaw: x._id,                        // real Mongo id for API calls
        title: x.title,
        price: typeof x.price === 'number' ? x.price / 100 : 0,             // paise -> rupees
        image: x.images?.[0] || '',
        images: x.images || [],
        description: x.description,
        category: x.category,
        location: x.location,
        sku: x.sku,
        sellerId: (x as any).sellerId?._id ?? (x as any).sellerId, // populated or raw
        sellerName:
          (x as any).sellerId?.sellerProfile?.shopName ||
          (x as any).sellerId?.name ||
          'Seller',
      }));

      setFavorites(mapped);
      addLog('Favorites', `Loaded ${mapped.length} favorite items`, 'api');
     } catch (error) {
       console.error('Failed to load favorites:', error);
       addLog('Favorites Error', 'Failed to load favorites', 'error');
     } finally {
       setLoading(false);
     }
   };



  const handleRemoveFromFavorites = async (product: any) => {
     try {
      const realId =
        product.idRaw ??
        (product.id && product.id.includes('-') ? product.id.split('-')[0] : product.id);
      if (realId) {
        await removeFavorite(realId);
      }
      setFavorites(prev => prev.filter((p: any) => p.id !== product.id));
       addLog('Favorites', `Removed "${product.title}" from favorites`, 'click');
       
       toast({
         title: "Removed from Favorites",
         description: `${product.title} has been removed from your favorites.`,
       });
     } catch (error) {
       console.error('Failed to remove from favorites:', error);
       toast({
         title: "Error",
         description: "Failed to remove item from favorites. Please try again.",
         variant: "destructive",
       });
     }
   };

   

  const handleClearAllFavorites = () => {
    setFavorites([]);
    addLog('Favorites', 'Cleared all favorites', 'click');
    toast({
      title: "Favorites Cleared",
      description: "All items have been removed from your favorites.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex justify-between items-center">
            <div className="bg-muted rounded h-8 w-1/3"></div>
            <div className="bg-muted rounded h-10 w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No favorites yet</h1>
          <p className="text-muted-foreground mb-6">
            Start browsing and click the heart icon on products you love to save them here.
          </p>
          <Button variant="default" size="lg" asChild>
            <a href="/browse">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} item{favorites.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        
        {favorites.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearAllFavorites}
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <Card key={product.id} className="marketplace-card group relative">
            <CardContent className="p-0">
              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFromFavorites(product)}
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </Button>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                  {product.title}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="price-tag text-lg font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                    <span>{product.likes}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  by {product.sellerName}
                </p>

                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/product/${product.id}`}>View Details</a>
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    {product.condition}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="marketplace-card mt-12">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">💡 Tips for Managing Favorites</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Stay Organized</h4>
              <ul className="space-y-1">
                <li>• Remove items you're no longer interested in</li>
                <li>• Check favorites regularly for price drops</li>
                <li>• Contact sellers if items have been favorited for a while</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Smart Shopping</h4>
              <ul className="space-y-1">
                <li>• Set up alerts for price changes</li>
                <li>• Compare similar items in your favorites</li>
                <li>• Read seller reviews before purchasing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}