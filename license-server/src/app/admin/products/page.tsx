'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';

interface ProductTier {
  tier: string;
  name: string;
  price: number;
  maxDomains: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  keyPrefix: string;
  currentVersion: string;
  isActive: boolean;
  tiers: ProductTier[];
  _count: {
    licenses: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?includeInactive=true');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLowestPrice = (tiers: ProductTier[]) => {
    if (tiers.length === 0) return 0;
    return Math.min(...tiers.map((t) => t.price));
  };

  const getHighestPrice = (tiers: ProductTier[]) => {
    if (tiers.length === 0) return 0;
    return Math.max(...tiers.map((t) => t.price));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your plugins and their pricing tiers
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center py-8 text-muted-foreground">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products yet</h3>
              <p className="text-muted-foreground text-center mt-1">
                Create your first product to start generating licenses
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {product.name}
                      {!product.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      <code className="text-xs">{product.keyPrefix}</code> • v{product.currentVersion}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Licenses</span>
                    <span className="font-medium">{product._count.licenses}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price Range</span>
                    <span className="font-medium">
                      {formatCurrency(getLowestPrice(product.tiers))} -{' '}
                      {formatCurrency(getHighestPrice(product.tiers))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tiers</span>
                    <span className="font-medium">{product.tiers.length}</span>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Available Tiers</p>
                    <div className="flex flex-wrap gap-1">
                      {product.tiers.map((tier) => (
                        <Badge key={tier.tier} variant="outline" className="text-xs">
                          {tier.name} ({formatCurrency(tier.price)})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
