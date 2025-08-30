import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { useLog } from '@/contexts/LogContext';
import { productsApi, Product } from '@/services/api';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { addLog } = useLog();

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    if (searchQuery) {
      loadSearchResults();
    }
  }, [searchQuery, filters, page]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts(page, 12, searchQuery, undefined, filters);
      setProducts(response.products);
      setTotal(response.total);
      addLog('Search Results', `Found ${response.total} results for "${searchQuery}"`, 'search');
    } catch (error) {
      console.error('Search failed:', error);
      addLog('Search Error', `Search failed for "${searchQuery}"`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
    addLog('Search Filter', `Applied filters to search: ${JSON.stringify(newFilters)}`, 'click');
  };

  const clearSearch = () => {
    setSearchParams({});
    setProducts([]);
    setTotal(0);
    addLog('Search', 'Cleared search', 'click');
  };

  if (!searchQuery) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Search Products</h1>
        <p className="text-muted-foreground mb-6">
          Use the search bar above to find products you're looking for.
        </p>
        <Button variant="default" asChild>
          <a href="#search" onClick={() => document.querySelector('input')?.focus()}>
            Start Searching
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `${total} results for "${searchQuery}"`}
            </p>
          </div>
          
          <Button variant="outline" onClick={clearSearch}>
            <X className="w-4 h-4 mr-2" />
            Clear Search
          </Button>
        </div>

        {/* Current Search Query */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Search:</span>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            "{searchQuery}"
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        <div className="text-sm text-muted-foreground">
          {!loading && `Showing ${products.length} of ${total} results`}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterSidebar onFiltersChange={handleFilterChange} />
        </div>

        {/* Search Results */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="marketplace-card p-4 animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              
              {products.length < total && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    size="lg"
                  >
                    Load More Results
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