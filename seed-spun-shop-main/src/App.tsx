import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SeedThemeProvider } from "@/contexts/SeedThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LogProvider } from "@/contexts/LogContext";
import { Layout } from "@/components/layout/Layout";

// Pages
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SellerProfile from "./pages/SellerProfile";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import LogsRecent from "./pages/LogsRecent";
import HealthCheck from "./pages/HealthCheck";
import Browse from "./pages/Browse";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { ROLLNO } from "@/utils/seed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SeedThemeProvider>
        <AuthProvider>
          <CartProvider>
            <LogProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/browse" element={<Browse />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/seller/:id" element={<SellerProfile />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/logs/recent" element={<LogsRecent />} />
                      <Route path={`/${ROLLNO}/healthz`} element={<HealthCheck />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </BrowserRouter>
              </TooltipProvider>
            </LogProvider>
          </CartProvider>
        </AuthProvider>
      </SeedThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
