'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  slug: string;
  keyPrefix: string;
  tiers: {
    tier: string;
    name: string;
    price: number;
    maxDomains: number;
    features: string[];
    supportMonths: number;
  }[];
}

const tierLabels: Record<string, string> = {
  STANDARD: 'Standard',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
  DEVELOPER: 'Developer',
};

export default function GenerateLicensePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    tier: 'STANDARD',
    customerEmail: '',
    customerName: '',
    domainLockMode: 'LOCKED',
    expiresAt: '',
    orderId: '',
    orderSource: 'MANUAL',
    notes: '',
    sendEmail: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products);
      if (data.products.length > 0) {
        setFormData((prev) => ({ ...prev, productId: data.products[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const selectedTier = selectedProduct?.tiers.find((t) => t.tier === formData.tier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create license');
      }

      router.push(`/admin/licenses/${data.license.id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/licenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generate License</h2>
          <p className="text-muted-foreground">
            Create a new license key for a customer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Product & Tier</CardTitle>
              <CardDescription>
                Select the product and license tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, productId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.keyPrefix})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">License Tier</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedProduct?.tiers.map((tier) => (
                    <div
                      key={tier.tier}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        formData.tier === tier.tier
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, tier: tier.tier }))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tier.name}</span>
                        <span className="text-lg font-bold">${tier.price}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tier.maxDomains === 999 ? 'Unlimited' : tier.maxDomains} domains
                        {' • '}
                        {tier.supportMonths === 999 ? 'Lifetime' : `${tier.supportMonths}mo`} support
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Domain Lock Mode</Label>
                <Select
                  value={formData.domainLockMode}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, domainLockMode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCKED">Locked (Recommended)</SelectItem>
                    <SelectItem value="UNLOCKED">Unlocked (Any domain)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Locked mode restricts the license to registered domains only
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Enter the customer details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerEmail: e.target.value,
                      }))
                    }
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID (Optional)</Label>
                  <Input
                    id="orderId"
                    value={formData.orderId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderId: e.target.value,
                      }))
                    }
                    placeholder="envato-12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order Source</Label>
                  <Select
                    value={formData.orderSource}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, orderSource: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="ENVATO">CodeCanyon</SelectItem>
                      <SelectItem value="GUMROAD">Gumroad</SelectItem>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiresAt">License Expiration (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for lifetime license
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Internal notes about this license..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sendEmail: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="sendEmail" className="font-normal">
                  Send license key email to customer
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {selectedProduct && selectedTier && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License Key:</span>
                    <span className="font-mono">
                      {selectedProduct.keyPrefix}-{formData.tier.substring(0, 3)}-XXXXXXXX-XXXX
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <span>{selectedTier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Domains:</span>
                    <span>
                      {selectedTier.maxDomains === 999 ? 'Unlimited' : selectedTier.maxDomains}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{formData.expiresAt || 'Never (Lifetime)'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/licenses">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !formData.productId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate License'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
