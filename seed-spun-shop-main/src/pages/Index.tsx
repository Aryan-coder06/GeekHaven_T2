import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Star, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { useLog } from '@/contexts/LogContext';
import { fetchListings, type Listing } from '@/services/products';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';
import { generateProductId } from '@/utils/seed';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addLog } = useLog();
  const { seed } = useSeedTheme();

  // useEffect(() => {
  //   loadFeaturedProducts();
  // }, []);

  // const loadFeaturedProducts = async () => {
  //   try {
  //     const response = await productsApi.getProducts(1, 8);
  //     setFeaturedProducts(response.products);
  //     addLog('Homepage', 'Loaded featured products', 'api');
  //   } catch (error) {
  //     console.error('Failed to load featured products:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  useEffect(() => {
    (async () => {
      try {
        const { items } = await fetchListings({ page: 1, limit: 8, sort: '-createdAt' });
        const mapped = items.map((x: Listing) => ({
          id: generateProductId(x._id, seed),
          idRaw: x._id,
          title: x.title,
          price: typeof x.price === 'number' ? x.price / 100 : 0,
          image: x.images?.[0] || '',
          description: x.description,
          category: x.category,
          location: x.location || '',
          sku: x.sku || '',
          sellerId: x.sellerId?._id,
          sellerName: x.sellerId?.sellerProfile?.shopName || x.sellerId?.name || 'Seller',
        }));
        setFeaturedProducts(mapped);
        addLog('API', 'Loaded featured products', 'api');
      } finally {
        setLoading(false);
      }
    })();
  }, [seed]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addLog('Search', `Homepage search: "${searchQuery}"`, 'search');
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            Discover Amazing Deals
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Your trusted marketplace for unique finds, powered by seed-based algorithms. 
            Theme generated from: <span className="font-mono">{seed}</span>
          </p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/browse">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1M+</div>
              <div className="text-muted-foreground">Products Listed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Happy Sellers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">4.8★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{seed.split('-')[1]}%</div>
              <div className="text-muted-foreground">Platform Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Discover the most popular items on our marketplace</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="marketplace-card p-4 animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/browse">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Marketplace?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="marketplace-card text-center">
              <CardContent className="p-8">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Seed-Based Algorithms</h3>
                <p className="text-muted-foreground">
                  Dynamic pricing and features powered by cryptographic seed technology for fairness and transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="marketplace-card text-center">
              <CardContent className="p-8">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Trusted Sellers</h3>
                <p className="text-muted-foreground">
                  All sellers are verified with rating systems and buyer protection to ensure safe transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="marketplace-card text-center">
              <CardContent className="p-8">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Price History</h3>
                <p className="text-muted-foreground">
                  Track price trends with detailed charts to make informed purchasing decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
