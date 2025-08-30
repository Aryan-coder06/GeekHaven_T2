import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useLog } from '@/contexts/LogContext';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api';
import { getSeedNumber, ASSIGNMENT_SEED } from '@/utils/seed';
import {checkout} from '@/services/checkout';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [signature, setSignature] = useState('');
  const [serverReceipt, setServerReceipt] = useState<any | null>(null);
  const { items, clearCart, formattedSubtotal, formattedPlatformFee, formattedTotal, subtotal, platformFee, total } = useCart();
  const { addLog } = useLog();
  const { toast } = useToast();
  const navigate = useNavigate();


    // Helper: format paise → INR
  const formatINR = (paise: number) =>
    (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const [billingInfo, setBillingInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemsPayload = items.map((item) => ({
        listingId: (item as any).idRaw ?? (item.id.includes('-') ? item.id.split('-')[0] : item.id),
        qty: item.quantity,
      }));
      const subtotalPaise = Math.round(subtotal * 100); // rupees -> paise

      const { data, signature } = await checkout(itemsPayload, subtotalPaise);
      setSignature(signature || '');
      setServerReceipt(data);
      setOrderComplete(true);
      clearCart();
      
      // addLog('Checkout', `Order completed: ${response.orderId}`, 'cart');
      addLog('Checkout', `Order completed: chargedTotal=${data?.chargedTotal} paise`, 'cart');
      
      toast({
        title: "Order Successful!",
        description: `Your order has been placed successfully.`,
      });

    } catch (error) {
      console.error('Checkout failed:', error);
      addLog('Checkout Error', 'Checkout process failed', 'error');
      toast({
        title: "Checkout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);  
    }
  };

  // ✅ Success view (rendered immediately after order completes)
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-muted-foreground">Platform fee (% from seed)</div>
                <div className="font-semibold">{serverReceipt?.nFromSeed}%</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-muted-foreground">Platform fee (amount)</div>
                <div className="font-semibold">
                  {serverReceipt ? formatINR(serverReceipt.platformFee) : '-'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                <div className="text-muted-foreground">Charged total</div>
                <div className="text-lg font-bold">
                  {serverReceipt ? formatINR(serverReceipt.chargedTotal) : '-'}
                </div>
              </div>
            </div>

            {signature && (
              <div className="mt-4">
                <div className="text-muted-foreground mb-1">Signature (HMAC)</div>
                <code className="block rounded-md bg-muted p-3 break-all">{signature}</code>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button asChild>
                <Link to="/browse">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/logs/recent">View Activity Log</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }




  if (items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
        <Button variant="default" asChild>
          <Link to="/browse">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">Order Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been processed successfully.
          </p>

          {/* Developer Info Panel */}
          {signature && (
            <Card className="marketplace-card mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Developer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">X-Signature:</span>
                    <div className="font-mono bg-muted p-2 rounded mt-1 text-xs">
                      {signature}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Platform Fee:</span>
                    <div className="font-medium">{formattedPlatformFee} ({getSeedNumber(ASSIGNMENT_SEED) % 10}%)</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seed Number:</span>
                    <div className="font-medium">{getSeedNumber(ASSIGNMENT_SEED)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Charged:</span>
                    <div className="font-medium price-tag">{formattedTotal}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center space-x-4">
            <Button variant="default" asChild>
              <Link to="/browse">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Card className="marketplace-card">
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      First Name
                    </label>
                    <Input
                      value={billingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Last Name
                    </label>
                    <Input
                      value={billingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="search-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Address
                  </label>
                  <Input
                    value={billingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    className="search-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      City
                    </label>
                    <Input
                      value={billingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      ZIP Code
                    </label>
                    <Input
                      value={billingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Card Number
                  </label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={billingInfo.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    required
                    className="search-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Expiry Date
                    </label>
                    <Input
                      placeholder="MM/YY"
                      value={billingInfo.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      CVV
                    </label>
                    <Input
                      placeholder="123"
                      value={billingInfo.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                  variant="cart"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : `Pay ${formattedTotal}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="marketplace-card sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee ({getSeedNumber(ASSIGNMENT_SEED) % 10}%)</span>
                  <span>{formattedPlatformFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="price-tag">{formattedTotal}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  🔒 Your payment information is secure and encrypted. Platform fee is calculated using seed-based algorithm.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}