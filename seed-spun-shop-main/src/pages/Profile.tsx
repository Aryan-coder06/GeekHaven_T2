import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail, Store, ImageOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLog } from '@/contexts/LogContext';
import {
  fetchMe,
  updateMe,
  becomeSeller,
  updateSellerProfile,
  fetchMyListings,
  type Me,
  type SellerProfile,
} from '@/services/account';
import { formatCurrency } from '@/utils/seed';

const initials = (name?: string) =>
  (name || 'U N')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [account, setAccount] = useState({
    name: '',
    phone: '',
    location: '',
    address: '',
  });

  const [seller, setSeller] = useState<SellerProfile>({
    shopName: '',
    bio: '',
    avatarUrl: '',
    address: '',
  });

  const isSellerMode = !!(me?.isSeller || me?.role === 'SELLER' || me?.role === 'ADMIN');

  // ---- My Listings state ----
  const [myItems, setMyItems] = useState<any[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myPage, setMyPage] = useState(1);
  const [loadingMy, setLoadingMy] = useState(false);

  // Load profile
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMe();
        setMe(data);
        setAccount({
          name: data.name || '',
          phone: data.phone || '',
          location: data.location || '',
          address: data.address || '',
        });
        setSeller({
          shopName: data.sellerProfile?.shopName || '',
          bio: data.sellerProfile?.bio || '',
          avatarUrl: data.sellerProfile?.avatarUrl || data.avatar || '',
          address: data.sellerProfile?.address || data.address || '',
        });
      } catch (e) {
        console.error('Failed to load profile', e);
        toast({
          title: 'Could not load profile',
          description: 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  // Load my listings
  const loadMyListings = async (page = 1) => {
    setLoadingMy(true);
    try {
      const { items, total } = await fetchMyListings({ page, limit: 12, sort: '-createdAt' });
      setMyItems((prev) => (page === 1 ? items : [...prev, ...items]));
      setMyTotal(total || 0);
      setMyPage(page);
    } catch (e) {
      console.error('Failed to load my listings', e);
    } finally {
      setLoadingMy(false);
    }
  };

  useEffect(() => {
    if (authUser) loadMyListings(1);
  }, [authUser, isSellerMode]);

  const onAccountChange = (k: keyof typeof account, v: string) =>
    setAccount((p) => ({ ...p, [k]: v }));

  const onSellerChange = (k: keyof SellerProfile, v: string) =>
    setSeller((p) => ({ ...p, [k]: v }));

  const handleUpgradeToSeller = async () => {
    try {
      const payload: SellerProfile = {
        shopName: seller.shopName || `Shop of ${account.name || me?.name || 'Me'}`,
        bio: seller.bio || 'New seller',
        avatarUrl: seller.avatarUrl,
        address: seller.address || account.address,
      };
      const updated = await becomeSeller(payload);
      setMe(updated);
      toast({ title: 'Welcome, seller!', description: 'Your seller account is active.' });
      addLog('Profile', 'Became seller', 'api');
    } catch (e) {
      console.error(e);
      toast({ title: 'Upgrade failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveSeller = async () => {
    try {
      const updated = await updateSellerProfile(seller);
      setMe(updated);
      toast({ title: 'Seller info updated' });
      addLog('Profile', 'Updated seller profile', 'api');
    } catch (e) {
      console.error(e);
      toast({ title: 'Save failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveAccount = async () => {
    try {
      const updated = await updateMe(account);
      setMe(updated);
      toast({ title: 'Profile updated' });
      addLog('Profile', 'Updated account', 'api');
    } catch (e) {
      console.error(e);
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  if (!authUser) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to view your profile</CardTitle>
          </CardHeader>
        </Card>
        <div className="mt-6">
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card><CardContent className="h-28 animate-pulse" /></Card>
          <Card><CardContent className="h-40 animate-pulse" /></Card>
          <Card><CardContent className="h-64 animate-pulse" /></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={me?.avatar || seller.avatarUrl} />
                <AvatarFallback>{initials(me?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{me?.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {me?.email}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Buyer</Badge>
                  {isSellerMode && <Badge variant="default">Seller</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Become Seller Section */}
        {!isSellerMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Become a Seller
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="Your shop name"
                  value={seller.shopName || ''}
                  onChange={(e) => onSellerChange('shopName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell customers about yourself"
                  value={seller.bio || ''}
                  onChange={(e) => onSellerChange('bio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://…"
                  value={seller.avatarUrl || ''}
                  onChange={(e) => onSellerChange('avatarUrl', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerAddress">Business Address</Label>
                <Input
                  id="sellerAddress"
                  placeholder="Address"
                  value={seller.address || ''}
                  onChange={(e) => onSellerChange('address', e.target.value)}
                />
              </div>
              <Button onClick={handleUpgradeToSeller} className="w-full">
                Upgrade to Seller Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Seller Information Form */}
        {isSellerMode && (
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shopName2">Shop Name</Label>
                  <Input
                    id="shopName2"
                    value={seller.shopName || ''}
                    onChange={(e) => onSellerChange('shopName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerAddress2">Business Address</Label>
                  <Input
                    id="sellerAddress2"
                    value={seller.address || ''}
                    onChange={(e) => onSellerChange('address', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio2">Bio / Description</Label>
                <Textarea
                  id="bio2"
                  rows={4}
                  value={seller.bio || ''}
                  onChange={(e) => onSellerChange('bio', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="avatarUrl2">Avatar URL</Label>
                <Input
                  id="avatarUrl2"
                  value={seller.avatarUrl || ''}
                  onChange={(e) => onSellerChange('avatarUrl', e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleSaveSeller}>
                Save Seller Information
              </Button>
            </CardContent>
          </Card>
        )}

        {/* My Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Listings</CardTitle>
              <Button asChild>
                <Link to="/sell">Add New Product</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingMy && myItems.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="marketplace-card p-4 animate-pulse">
                    <div className="bg-muted rounded-lg h-40 mb-3" />
                    <div className="bg-muted rounded h-4 mb-2" />
                    <div className="bg-muted rounded h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : myItems.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products listed yet</p>
                <p className="text-sm">Start by adding your first product to sell</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myItems.map((it) => {
                    const priceRupees = typeof it.price === 'number' ? it.price / 100 : 0;
                    const img = it.images?.[0];
                    return (
                      <Link
                        key={it._id}
                        to={`/product/${it._id}`}
                        className="marketplace-card overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-muted relative">
                          {img ? (
                            <img
                              src={img}
                              alt={it.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageOff className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="font-medium line-clamp-1">{it.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {it.category}
                          </div>
                          <div className="mt-2 font-semibold">{formatCurrency(priceRupees)}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {myItems.length < myTotal && (
                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => loadMyListings(myPage + 1)}
                      disabled={loadingMy}
                    >
                      {loadingMy ? 'Loading…' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={account.name}
                  onChange={(e) => onAccountChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    value={account.phone}
                    onChange={(e) => onAccountChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    className="pl-10"
                    placeholder="City"
                    value={account.location}
                    onChange={(e) => onAccountChange('location', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={account.address}
                  onChange={(e) => onAccountChange('address', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={me?.email || ''} disabled />
            </div>

            <Button onClick={handleSaveAccount}>Update Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
