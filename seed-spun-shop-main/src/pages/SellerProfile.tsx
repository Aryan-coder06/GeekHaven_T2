import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Clock, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { useLog } from '@/contexts/LogContext';
import { productsApi, Seller, Product } from '@/services/api';

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addLog } = useLog();

  useEffect(() => {
    if (id) {
      loadSellerProfile(id);
    }
  }, [id]);

  const loadSellerProfile = async (sellerId: string) => {
    try {
      setLoading(true);
      const sellerData = await productsApi.getSeller(sellerId);
      setSeller(sellerData);
      
      // Load seller's listings
      const productsResponse = await productsApi.getProducts(1, 20);
      const sellerListings = productsResponse.products.filter(p => p.sellerId === sellerId);
      setListings(sellerListings);
      
      addLog('Seller Profile', `Viewed seller profile: ${sellerData.name}`, 'click');
    } catch (error) {
      console.error('Failed to load seller profile:', error);
      addLog('Error', `Failed to load seller profile ${sellerId}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-muted rounded-full"></div>
            <div className="space-y-3 flex-1">
              <div className="bg-muted rounded h-8 w-1/3"></div>
              <div className="bg-muted rounded h-4 w-1/2"></div>
              <div className="bg-muted rounded h-4 w-1/4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Seller Not Found</h1>
        <Button variant="default" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Seller Header */}
      <Card className="marketplace-card mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            </div>

            {/* Seller Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{seller.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{seller.rating.toFixed(1)}</span>
                    <span>({seller.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{seller.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {seller.joinedDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground">{seller.bio}</p>

              <div className="flex items-center space-x-1 text-sm">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {seller.responseTime}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button variant="default" size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
              <Button variant="outline" size="lg">
                Follow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="marketplace-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{listings.length}</div>
            <div className="text-sm text-muted-foreground">Active Listings</div>
          </CardContent>
        </Card>
        
        <Card className="marketplace-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{seller.rating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Seller Rating</div>
          </CardContent>
        </Card>
        
        <Card className="marketplace-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{seller.reviewCount}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
        
        <Card className="marketplace-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.floor((Date.now() - seller.joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 30))}
            </div>
            <div className="text-sm text-muted-foreground">Months Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Seller's Listings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Listings by {seller.name}</h2>
          <Badge variant="secondary" className="text-sm">
            {listings.length} items
          </Badge>
        </div>

        {listings.length === 0 ? (
          <Card className="marketplace-card">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-sm">This seller hasn't posted any items for sale.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProductGrid products={listings} />
        )}
      </div>

      {/* Reviews Section */}
      <Card className="marketplace-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Customer Reviews</h3>
          
          <div className="space-y-4">
            {/* Mock reviews */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Customer {i + 1}</div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3 h-3 ${
                              j < 4 + i % 2 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {i + 1} day{i !== 0 ? 's' : ''} ago
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Great seller! Fast shipping and item exactly as described. 
                  {i === 0 && ' Highly recommend!'} 
                  {i === 1 && ' Would buy again.'} 
                  {i === 2 && ' Excellent communication.'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline">View All Reviews</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}