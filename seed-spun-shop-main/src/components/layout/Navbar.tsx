import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Bell,
  Settings,
  LogOut,
  Home,
  Grid3X3,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLog } from '@/contexts/LogContext';
import { useTheme } from 'next-themes';
import { useSeedTheme } from '@/contexts/SeedThemeProvider';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { addLog } = useLog();
  const { theme, setTheme } = useTheme();
  const { seed } = useSeedTheme();
  const navigate = useNavigate();

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addLog('Search', `Query: "${searchQuery}"`, 'search');
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleNavClick = (action: string, path: string) => {
    addLog('Navigation', `Clicked: ${action}`, 'navigation');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    addLog('Theme Toggle', `Switched to ${newTheme} mode`, 'click');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary-glow transition-smooth"
            onClick={() => handleNavClick('Logo', '/')}
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white font-black">
              M
            </div>
            <span className="hidden md:block">Marketplace</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => handleNavClick('Home', '/')}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-floating z-50 animate-fade-in">
                  <div className="p-2">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        to={`/browse?category=${category.toLowerCase()}`}
                        className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-smooth"
                        onClick={() => {
                          setCategoriesOpen(false);
                          handleNavClick('Category', `/browse?category=${category.toLowerCase()}`);
                        }}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/browse" 
              className="text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => handleNavClick('Browse', '/browse')}
            >
              Browse All
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Favorites */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <Link 
                to="/favorites"
                onClick={() => handleNavClick('Favorites', '/favorites')}
              >
                <Heart className="w-5 h-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative hover:bg-accent hover:text-accent-foreground"
            >
              <Link 
                to="/cart"
                onClick={() => handleNavClick('Cart', '/cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce-in"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="hidden lg:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-floating">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/login">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Cart for mobile */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative"
            >
              <Link to="/cart">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-4">
          <form onSubmit={handleSearch}>
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="mr-2 w-4 h-4" />
                  Favorites
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                className="justify-start" 
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
              >
                {theme === 'dark' ? <Sun className="mr-2 w-4 h-4" /> : <Moon className="mr-2 w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>

              {user ? (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User className="mr-2 w-4 h-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start text-destructive" 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="default" className="justify-start" asChild>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Seed Theme Indicator */}
      <div className="absolute top-0 left-0 w-full h-1 gradient-primary opacity-60"></div>
    </nav>
  );
}