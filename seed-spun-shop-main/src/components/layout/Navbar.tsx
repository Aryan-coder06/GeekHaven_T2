import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Home,
  Grid3X3,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { addLog } = useLog();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const categories = [
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
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/browse' && location.pathname.startsWith('/browse'));

  const navPill =
    'px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-background/60';

  const handleNavClick = (label: string) =>
    addLog('Navigation', `Clicked: ${label}`, 'navigation');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    addLog('Theme Toggle', `Switched to ${next}`, 'click');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 supports-[backdrop-filter]:backdrop-blur-md backdrop-saturate-150">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => handleNavClick('Logo')}
            className="flex items-center space-x-2 text-xl font-bold text-primary hover:opacity-90 transition"
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white font-black">
              M
            </div>
            <span className="hidden md:block text-foreground">Marketplace</span>
          </Link>

          {/* Center nav (frosted pill group) */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 supports-[backdrop-filter]:backdrop-blur-md px-2 py-1 shadow-sm">
              <Link
                to="/"
                onClick={() => handleNavClick('Home')}
                className={`${navPill} flex items-center gap-2 ${
                  isActive('/') ? 'bg-background/60' : 'text-foreground'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <div className="relative">
                <button
                  aria-expanded={categoriesOpen}
                  aria-controls="nav-categories"
                  onClick={() => setCategoriesOpen((v) => !v)}
                  className={`${navPill} flex items-center gap-2 ${
                    categoriesOpen || location.search.includes('category=')
                      ? 'bg-background/60'
                      : 'text-foreground'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      categoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {categoriesOpen && (
                  <div
                    id="nav-categories"
                    className="absolute left-0 mt-2 w-56 rounded-xl border border-border bg-popover/80 supports-[backdrop-filter]:backdrop-blur-md shadow-lg p-2 z-50"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <Link
                          key={c}
                          to={`/browse?category=${encodeURIComponent(c)}`}
                          onClick={() => {
                            setCategoriesOpen(false);
                            handleNavClick(`Category:${c}`);
                          }}
                          className="px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/browse"
                onClick={() => handleNavClick('Browse')}
                className={`${navPill} ${
                  isActive('/browse') ? 'bg-background/60' : 'text-foreground'
                }`}
              >
                Browse
              </Link>
            </div>
          </div>

          {/* Right actions (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" asChild className="hover:bg-accent">
              <Link to="/favorites" onClick={() => handleNavClick('Favorites')}>
                <Heart className="w-5 h-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative hover:bg-accent">
              <Link to="/cart" onClick={() => handleNavClick('Cart')}>
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="hidden lg:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border border-border">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" onClick={() => handleNavClick('Profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/login">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggles */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <Home className="mr-2 w-4 h-4" />
                  Home
                </Link>
              </Button>

              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/browse" onClick={() => setIsMenuOpen(false)}>
                  Browse
                </Link>
              </Button>

              <div className="px-2">
                <div className="text-xs uppercase text-muted-foreground mb-1">Categories</div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c}
                      to={`/browse?category=${encodeURIComponent(c)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2 rounded-md text-sm bg-muted/40 hover:bg-muted transition"
                    >
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" asChild>
                  <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="mr-2 w-4 h-4" />
                    Favorites
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                >
                  {theme === 'dark' ? <Sun className="mr-2 w-4 h-4" /> : <Moon className="mr-2 w-4 h-4" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>

              {user ? (
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
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="default" className="flex-1" asChild>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* subtle top accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] gradient-primary opacity-60" />
    </nav>
  );
}
