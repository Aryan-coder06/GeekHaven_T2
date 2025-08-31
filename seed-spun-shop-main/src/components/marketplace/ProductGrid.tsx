import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useLog } from '@/contexts/LogContext';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/services/api';

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
}

export function ProductGrid({ products, viewMode = 'grid' }: ProductGridProps) {
  const { addItem } = useCart();
  const { addLog } = useLog();
  const { toast } = useToast();

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
    });
    
    addLog('Cart', `Added "${product.title}" to cart from grid`, 'cart');
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleProductClick = (product: Product) => {
    addLog('Product Click', `Clicked on "${product.title}"`, 'click');
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            onClick={() => handleProductClick(product)}
            className="block"
          >
            <Card className="marketplace-card hover:shadow-floating transition-all">
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center space-x-4 mb-2 text-sm text-muted-foreground">
                          <span>by {product.sellerName}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{typeof product.sellerRating === 'number'? product.sellerRating.toFixed(1): '—'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{product.location}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {product.description}
                        </p>

                        <div className="flex items-center space-x-4 mb-2">
                          <Badge variant="secondary">{product.category}</Badge>
                          <Badge variant="outline">{product.condition}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>

                      <div className="text-right">
                        <p className="price-tag text-2xl font-bold mb-3">
                          {typeof product.price === 'number' ? `₹${product.price.toFixed(2)}`: '₹--'}
                        </p>
                        
                        <Button
                          variant="cart"
                          size="sm"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.id}`}
          onClick={() => handleProductClick(product)}
          className="block group"
        >
          <Card className="marketplace-card h-full">
            <CardContent className="p-0">
              
              <div className="aspect-square overflow-hidden rounded-t-lg relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3 h-3" />
                    <span>{product.views}</span>
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    {product.isLiked && (
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {product.condition}
                  </Badge>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="price-tag text-lg font-bold">
                    ${product?.price != null ? Number(product.price).toFixed(2) : '0.00'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3" />
                    <span>{product?.likes != null ? product.likes : 0}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {(product?.sellerName && product.sellerName.charAt(0)) || '?'}
                    </span>
                  </div>
                  <span className="truncate">{product?.sellerName || 'Seller'}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{product?.sellerRating != null ? Number(product.sellerRating).toFixed(1) : '—'}</span>
                  </div>
                </div>

                <Button
                  variant="cart"
                  size="sm"
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  Add to Cart
                </Button>

                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{product.location}</span>
                  </div>
                  <div>{product.sku}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}