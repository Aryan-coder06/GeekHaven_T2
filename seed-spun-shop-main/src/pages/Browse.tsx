import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { useLog } from '@/contexts/LogContext';
// import { productsApi, Product } from '@/services/api';

import { fetchListings, type Listing } from '@/services/products';
import { generateProductId } from '@/utils/seed';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';



// shallow compare to avoid re-setting identical filters
function shallowEqual(a: any, b: any) {
  const ak = Object.keys(a || {}), bk = Object.keys(b || {});
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}


export default function Browse() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { seed } = useSeedTheme();
  const { addLog } = useLog();

  

  // useEffect(() => {
  //     (async () => {
  //       setLoading(true);
  //       try {
  //         const p: any = filters || {};
  //         const params = {
  //           page,
  //           limit: 12,
  //           search: searchQuery || undefined,
  //           category: p.category && p.category !== 'all' ? p.category : undefined,
  //           min: p.minPrice ? Number(p.minPrice) * 100 : undefined, // rupees->paise
  //           max: p.maxPrice ? Number(p.maxPrice) * 100 : undefined,
  //           sort: '-createdAt',
  //         };
  //         const { items, total } = await fetchListings(params);
  //         const mapped = items.map((x: Listing) => ({
  //           id: generateProductId(x._id, seed),
  //           idRaw: x._id,
  //           title: x.title,
  //           price: typeof x.price === 'number' ? x.price / 100 : 0,

  //           image: x.images?.[0] || '',
  //           description: x.description,
  //           category: x.category,
  //           location: x.location || '',
  //           sku: x.sku || '',
  //           sellerId: x.sellerId?._id,
  //           sellerName: x.sellerId?.sellerProfile?.shopName || x.sellerId?.name || 'Seller',
  //         }));
  //         setProducts(prev => page === 1 ? mapped : [...prev, ...mapped]);
  //         setTotal(total);
  //       } finally {
  //         setLoading(false);
  //       }
  //     })();
  //   }, [page, searchQuery, filters, seed]);

  useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const p: any = filters || {};
      const params = {
        page,
        limit: 12,
        search: searchQuery || undefined,
        category: p.category || undefined,
        location: p.location || undefined,          // ✅ pass location
        min: typeof p.min === 'number' ? p.min : undefined, // ✅ send rupees
        max: typeof p.max === 'number' ? p.max : undefined, // ✅ send rupees
        // sort: 'price_asc' | 'price_desc' | undefined,     // optionally wire a sort control
      };

      const { items, total } = await fetchListings(params);

      const mapped = items.map((x: Listing) => ({
        id: generateProductId(x._id, seed),
        idRaw: x._id,
        title: x.title,
        price: typeof x.price === 'number' ? x.price / 100 : 0, // paise -> rupees (UI only)
        image: x.images?.[0] || '',
        description: x.description,
        category: x.category,
        location: x.location || '',
        sku: x.sku || '',
        sellerId: x.sellerId?._id,
        sellerName: x.sellerId?.sellerProfile?.shopName || x.sellerId?.name || 'Seller',
      }));

      setProducts(prev => (page === 1 ? mapped : [...prev, ...mapped]));
      setTotal(total);
    } catch (e) {
      console.error('Browse fetch failed', e);
    } finally {
      setLoading(false);
    }
  })();
}, [page, searchQuery, filters, seed]);




  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    addLog('Search', `Browse search: "${searchQuery}"`, 'search');
  };

  const handleFilterChange = useCallback((newFilters: any) => {
    setPage(1);
    setFilters(prev => (shallowEqual(prev, newFilters) ? prev : newFilters));
    addLog('Filter', `Applied filters: ${JSON.stringify(newFilters)}`, 'click');
  }, [addLog]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Browse Marketplace</h1>
        <p className="text-muted-foreground">Discover amazing items from sellers around the world</p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 search-input"
            />
          </div>
        </form>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterSidebar onFiltersChange={handleFilterChange} />
        </div>

        {/* Products */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="marketplace-card p-4 animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  Showing {products.length} of {total} products
                </p>
              </div>
              
              <ProductGrid products={products} viewMode={viewMode} />
              
              {products.length < total && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    size="lg"
                  >
                    Load More Products
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}




