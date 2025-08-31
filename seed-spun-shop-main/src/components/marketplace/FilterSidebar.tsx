// import React, { useState } from 'react';
// import { Filter, X, Search } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Slider } from '@/components/ui/slider';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { useLog } from '@/contexts/LogContext';

// interface FilterSidebarProps {
//   onFiltersChange: (filters: any) => void;
// }

// export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
//   const [filters, setFilters] = useState({
//     category: '',
//     condition: '',
//     minPrice: 0,
//     maxPrice: 1000,
//     location: '',
//     priceRange: [0, 1000],
//   });
//   const { addLog } = useLog();

//   const categories = [
//     'All Categories',
//     'Electronics',
//     'Fashion',
//     'Home & Garden',
//     'Sports',
//     'Books',
//     'Toys',
//     'Collectibles',
//     'Art & Crafts',
//     'Music',
//     'Automotive'
//   ];

//   const conditions = [
//     'All Conditions',
//     'New',
//     'Like New',
//     'Good',
//     'Fair',
//     'Poor'
//   ];

//   const locations = [
//     'All Locations',
//     'New York, NY',
//     'Los Angeles, CA',
//     'Chicago, IL',
//     'Houston, TX',
//     'Phoenix, AZ',
//     'Philadelphia, PA',
//     'San Antonio, TX',
//     'San Diego, CA',
//     'Dallas, TX',
//     'San Jose, CA'
//   ];

//   const updateFilter = (key: string, value: any) => {
//     const newFilters = { ...filters, [key]: value };
//     setFilters(newFilters);
    
//     // Clean up filters for API
//     const cleanFilters: any = {};
//     if (newFilters.category && newFilters.category !== 'All Categories') {
//       cleanFilters.category = newFilters.category;
//     }
//     if (newFilters.condition && newFilters.condition !== 'All Conditions') {
//       cleanFilters.condition = newFilters.condition;
//     }
//     if (newFilters.location && newFilters.location !== 'All Locations') {
//       cleanFilters.location = newFilters.location;
//     }
//     if (newFilters.priceRange[0] > 0) {
//       cleanFilters.minPrice = newFilters.priceRange[0];
//     }
//     if (newFilters.priceRange[1] < 1000) {
//       cleanFilters.maxPrice = newFilters.priceRange[1];
//     }

//     onFiltersChange(cleanFilters);
//     addLog('Filter', `Updated filter ${key}: ${value}`, 'click');
//   };

//   const clearAllFilters = () => {
//     const resetFilters = {
//       category: '',
//       condition: '',
//       minPrice: 0,
//       maxPrice: 1000,
//       location: '',
//       priceRange: [0, 1000],
//     };
//     setFilters(resetFilters);
//     onFiltersChange({});
//     addLog('Filter', 'Cleared all filters', 'click');
//   };

//   const hasActiveFilters = filters.category || filters.condition || filters.location || 
//     filters.priceRange[0] > 0 || filters.priceRange[1] < 1000;

//   return (
//     <Card className="marketplace-card sticky top-24">
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <Filter className="w-5 h-5" />
//             <span>Filters</span>
//           </div>
//           {hasActiveFilters && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAllFilters}
//               className="text-xs"
//             >
//               <X className="w-3 h-3 mr-1" />
//               Clear
//             </Button>
//           )}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Category Filter */}
//         <div>
//           <Label className="text-sm font-medium text-foreground mb-3 block">
//             Category
//           </Label>
//           <div className="space-y-2">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => updateFilter('category', category === 'All Categories' ? '' : category)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
//                   (filters.category || 'All Categories') === category
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted/50 text-muted-foreground hover:bg-muted'
//                 }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         </div>

//         <Separator />

//         {/* Price Range */}
//         <div>
//           <Label className="text-sm font-medium text-foreground mb-3 block">
//             Price Range
//           </Label>
//           <div className="space-y-4">
//             <Slider
//               value={filters.priceRange}
//               onValueChange={(value) => updateFilter('priceRange', value)}
//               max={1000}
//               min={0}
//               step={10}
//               className="w-full"
//             />
//             <div className="flex items-center justify-between text-sm text-muted-foreground">
//               <span>${filters.priceRange[0]}</span>
//               <span>${filters.priceRange[1]}</span>
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Condition Filter */}
//         <div>
//           <Label className="text-sm font-medium text-foreground mb-3 block">
//             Condition
//           </Label>
//           <div className="space-y-2">
//             {conditions.map((condition) => (
//               <button
//                 key={condition}
//                 onClick={() => updateFilter('condition', condition === 'All Conditions' ? '' : condition)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
//                   (filters.condition || 'All Conditions') === condition
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted/50 text-muted-foreground hover:bg-muted'
//                 }`}
//               >
//                 {condition}
//               </button>
//             ))}
//           </div>
//         </div>

//         <Separator />

//         {/* Location Filter */}
//         <div>
//           <Label className="text-sm font-medium text-foreground mb-3 block">
//             Location
//           </Label>
//           <div className="space-y-2">
//             {locations.slice(0, 6).map((location) => (
//               <button
//                 key={location}
//                 onClick={() => updateFilter('location', location === 'All Locations' ? '' : location)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
//                   (filters.location || 'All Locations') === location
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted/50 text-muted-foreground hover:bg-muted'
//                 }`}
//               >
//                 {location}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Active Filters Summary */}
//         {hasActiveFilters && (
//           <>
//             <Separator />
//             <div>
//               <Label className="text-sm font-medium text-foreground mb-3 block">
//                 Active Filters
//               </Label>
//               <div className="space-y-2">
//                 {filters.category && (
//                   <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
//                     <span>Category: {filters.category}</span>
//                     <button
//                       onClick={() => updateFilter('category', '')}
//                       className="hover:text-primary-dark"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 )}
//                 {filters.condition && (
//                   <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
//                     <span>Condition: {filters.condition}</span>
//                     <button
//                       onClick={() => updateFilter('condition', '')}
//                       className="hover:text-primary-dark"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 )}
//                 {filters.location && (
//                   <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
//                     <span>Location: {filters.location}</span>
//                     <button
//                       onClick={() => updateFilter('location', '')}
//                       className="hover:text-primary-dark"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 )}
//                 {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
//                   <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
//                     <span>Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
//                     <button
//                       onClick={() => updateFilter('priceRange', [0, 1000])}
//                       className="hover:text-primary-dark"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Filter, X, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLog } from '@/contexts/LogContext';

interface FilterSidebarProps {
  onFiltersChange: (filters: {
    search?: string;
    category?: string;
    location?: string;
    min?: number;
    max?: number;
    // condition?: string; // uncomment if you add backend support
  }) => void;
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const { addLog } = useLog();

  const categories = useMemo(
    () => [
      'All Categories',
      'electronics',
      'home',
      'fashion',
      'gaming',
      'sports',
      'books',
      'toys',
      'beauty',
      'tools',
      'outdoors',
    ],
    []
  );

  const conditions = useMemo(
    () => ['All Conditions', 'New', 'Like New', 'Good', 'Fair', 'Poor'],
    []
  );

  const locations = useMemo(
    () => [
      'All Locations',
      'Delhi',
      'Mumbai',
      'Chennai',
      'Kolkata',
      'Kochi',
      'Ahmedabad',
      'Jaipur',
      'Bengaluru',
      'Hyderabad',
    ],
    []
  );

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    location: '',
    priceRange: [0, 1000] as [number, number], // UI is in USD (demo). Backend treats numbers the same.
  });

  // Debounce helper so we don’t spam the parent
  const [debounced, setDebounced] = useState(filters);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters), 250);
    return () => clearTimeout(t);
  }, [filters]);

  const lastSentRef = useRef<string>('');

  useEffect(() => {
    const clean: any = {};
    if (debounced.search?.trim()) clean.search = debounced.search.trim();
    if (debounced.category) clean.category = debounced.category; // exact text match (case-insensitive on backend)
    if (debounced.location) clean.location = debounced.location; // same
    const [minV, maxV] = debounced.priceRange;
    if (minV > 0) clean.min = minV;
    if (maxV < 1000) clean.max = maxV;

    const key = JSON.stringify(clean);
    if (key !== lastSentRef.current) {
      lastSentRef.current = key;
      onFiltersChange(clean);
    }
  }, [debounced]);

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    addLog('Filter', `Updated ${key}: ${Array.isArray(value) ? value.join('-') : value}`, 'click');
  };

  const clearAllFilters = () => {
    const reset = {
      search: '',
      category: '',
      condition: '',
      location: '',
      priceRange: [0, 1000] as [number, number],
    };
    setFilters(reset);
    onFiltersChange({});
    addLog('Filter', 'Cleared all filters', 'click');
  };

  const hasActive =
    !!filters.search ||
    !!filters.category ||
    !!filters.location ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    !!filters.condition;

  return (
    <Card className="marketplace-card sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </div>
          {hasActive && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Search</Label>
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Title, description, category…"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Category */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">Category</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilter('category', cat === 'All Categories' ? '' : cat)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  (filters.category || 'All Categories') === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">Price Range</Label>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              max={1000}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Condition (UI only for now) */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">Condition</Label>
          <div className="grid grid-cols-2 gap-2">
            {conditions.map((cond) => (
              <button
                key={cond}
                onClick={() => updateFilter('condition', cond === 'All Conditions' ? '' : cond)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  (filters.condition || 'All Conditions') === cond
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">Location</Label>
          <div className="grid grid-cols-2 gap-2">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => updateFilter('location', loc === 'All Locations' ? '' : loc)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  (filters.location || 'All Locations') === loc
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Active summary */}
        {hasActive && (
          <>
            <Separator />
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Active Filters</Label>
              <div className="space-y-2">
                {filters.search ? (
                  <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <span>Search: {filters.search}</span>
                    <button onClick={() => updateFilter('search', '')}><X className="w-3 h-3" /></button>
                  </div>
                ) : null}
                {filters.category ? (
                  <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <span>Category: {filters.category}</span>
                    <button onClick={() => updateFilter('category', '')}><X className="w-3 h-3" /></button>
                  </div>
                ) : null}
                {filters.location ? (
                  <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <span>Location: {filters.location}</span>
                    <button onClick={() => updateFilter('location', '')}><X className="w-3 h-3" /></button>
                  </div>
                ) : null}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) ? (
                  <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <span>Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
                    <button onClick={() => updateFilter('priceRange', [0, 1000])}><X className="w-3 h-3" /></button>
                  </div>
                ) : null}
                {filters.condition ? (
                  <div className="flex items-center justify-between bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <span>Condition: {filters.condition}</span>
                    <button onClick={() => updateFilter('condition', '')}><X className="w-3 h-3" /></button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
