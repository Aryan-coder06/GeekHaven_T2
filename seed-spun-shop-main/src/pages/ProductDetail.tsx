import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useLog } from '@/contexts/LogContext';
import { useToast } from '@/hooks/use-toast';
import { PriceHistoryChart } from '@/components/marketplace/PriceHistoryChart';
import { fetchListing, type Listing } from '@/services/products';
import { generateProductId } from '@/utils/seed';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';
import { addFavorite, removeFavorite } from '@/services/favorites';


export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCart();
  const { addLog } = useLog();
  const { seed } = useSeedTheme();
  const { toast } = useToast();

  useEffect(() => {
     if (!id) return;
     const idParam = id;
     (async () => {
       try {
        const idRaw = idParam.includes('-') ? idParam.split('-')[0] : idParam;
        const x: Listing = await fetchListing(idRaw);
        setProduct({
          id: generateProductId(x._id, seed),
          idRaw: x._id,
          title: x.title,
          price: typeof x.price === 'number' ? x.price / 100 : 0,
          sku: x.sku,

          images: x.images || [],
          description: x.description,
          category: x.category,
          sellerId: x.sellerId?._id,
          sellerName: x.sellerId?.sellerProfile?.shopName || x.sellerId?.name || 'Seller',
          sellerAvatar: x.sellerId?.avatar,
          location: x.location,
          createdAt: x.createdAt,
        });
         addLog('API', `Loaded product ${idParam}`, 'api');
       } catch (e) {
         addLog('Error', `Failed to load product ${idParam}`, 'error');
       } finally {
         setLoading(false);
       }
     })();
  }, [id, seed]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        idRaw: product.idRaw,
        title: product.title,
        price: product.price,
        image: product.image?.[0] ?? '',
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      });
      
      addLog('Cart', `Added "${product.title}" to cart`, 'cart');
      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart.`,
      });
    }
  };


  const handleToggleLike = async () => {
     if (product) {
       try {
        const realId = product.idRaw ?? (product.id?.split('-')[0] || product.id);
        if (!isLiked) {
          await addFavorite(realId);
        } else {
          await removeFavorite(realId);
        }
        const next = !isLiked;
        setIsLiked(next);
        addLog('Like', `${next ? 'Liked' : 'Unliked'} "${product.title}"`, 'click');
         
         toast({
          title: (!isLiked) ? "Added to Favorites" : "Removed from Favorites",
          description: `${product.title} has been ${(!isLiked) ? 'added to' : 'removed from'} your favorites.`,
         });
       } catch (error) {
        console.error('Failed to toggle like:', error);
        addLog('Error', `Failed to toggle favorite for "${product.title}"`, 'error');
       }
     }
   };





  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-96 mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted rounded h-20"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="bg-muted rounded h-8 w-3/4"></div>
            <div className="bg-muted rounded h-6 w-1/2"></div>
            <div className="bg-muted rounded h-12 w-1/3"></div>
            <div className="bg-muted rounded h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <Button variant="default" asChild>
          <Link to="/browse">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const seeded = (s: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
  // const likesFor = (id: string) => 5 + (seeded('♥' + id) % 500); 
  const stableViews = product ? 100 + (seeded((product.idRaw ?? product.id ?? '') + '_v') % 9000) : 0;
  const stableLikes = product ? 5 + (seeded((product.idRaw ?? product.id ?? '') + '_l') % 500) : 0;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          
          {/* Thumbnail gallery would go here */}
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded bg-muted">
                <img
                  src={product.image}
                  alt={`${product.title} ${i + 1}`}
                  className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.condition}</Badge>
            </div>
            <p className="text-3xl font-bold price-tag">${product?.price != null ? Number(product.price).toFixed(2) : '0.00'} </p>
          </div>

          {/* Seller Info */}
          <Card className="marketplace-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {product.sellerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <Link 
                      to={`/seller/${product.sellerId}`}
                      className="font-semibold text-foreground hover:text-primary transition-smooth"
                    >
                      {product.sellerName}
                    </Link>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{product?.sellerRating != null ? Number(product.sellerRating).toFixed(1) : '—'}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/seller/${product.sellerId}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{product.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">SKU:</span> {product.sku}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="cart" 
              size="lg" 
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleToggleLike}
              className={isLiked ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{stableViews}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{stableLikes}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-primary">#{product.id.split('-')[1]}</p>
              <p className="text-xs text-muted-foreground">Item ID</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      {product.priceHistory && product.priceHistory.length > 0 && (
        <div className="mt-12">
          <Card className="marketplace-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Price History</h2>
              </div>
              <PriceHistoryChart data={product.priceHistory} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}