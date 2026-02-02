import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Mail, Clock, Globe, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import prisma from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/utils';

const statusColors: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  ACTIVE: 'success',
  EXPIRED: 'destructive',
  SUSPENDED: 'warning',
  REVOKED: 'destructive',
  REFUNDED: 'secondary',
};

const tierLabels: Record<string, string> = {
  STANDARD: 'Standard',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
  DEVELOPER: 'Developer',
};

async function getLicense(id: string) {
  const license = await prisma.license.findUnique({
    where: { id },
    include: {
      product: true,
      activations: {
        orderBy: { activatedAt: 'desc' },
      },
      createdBy: {
        select: { name: true, email: true },
      },
    },
  });

  return license;
}

export default async function LicenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const license = await getLicense(id);

  if (!license) {
    notFound();
  }

  const activeActivations = license.activations.filter((a) => a.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/licenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              License Details
            </h2>
            <Badge variant={statusColors[license.status]}>
              {license.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">
            {license.licenseKey}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send to Customer
          </Button>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Key
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* License Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>License Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{license.product.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tier</p>
                <p className="font-medium">{tierLabels[license.tier]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Domain Lock Mode</p>
                <p className="font-medium">{license.domainLockMode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Domains</p>
                <p className="font-medium">
                  {license.maxDomains === 999 ? 'Unlimited' : license.maxDomains}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {license.features.map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Customer Email</p>
                <p className="font-medium">{license.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium">{license.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{license.orderId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Source</p>
                <p className="font-medium">{license.orderSource || 'N/A'}</p>
              </div>
            </div>

            {license.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{license.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Purchased</p>
                  <p className="font-medium">{formatDate(license.purchasedAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Key className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">License Expires</p>
                  <p className="font-medium">
                    {license.expiresAt ? formatDate(license.expiresAt) : 'Never (Lifetime)'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Support Expires</p>
                  <p className="font-medium">
                    {license.supportExpiresAt ? formatDate(license.supportExpiresAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Extend Support
              </Button>
              {license.status === 'ACTIVE' && (
                <Button variant="outline" className="w-full justify-start text-yellow-600">
                  Suspend License
                </Button>
              )}
              {license.status === 'SUSPENDED' && (
                <Button variant="outline" className="w-full justify-start text-green-600">
                  Reactivate License
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start text-destructive">
                Revoke License
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activations */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activated Domains ({activeActivations.length} of{' '}
            {license.maxDomains === 999 ? '∞' : license.maxDomains})
          </CardTitle>
          <CardDescription>
            Domains where this license is currently active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {license.activations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No domains activated yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activated</TableHead>
                  <TableHead>Last Verified</TableHead>
                  <TableHead>Plugin Version</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {license.activations.map((activation) => (
                  <TableRow key={activation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{activation.domain}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={activation.isActive ? 'success' : 'secondary'}>
                        {activation.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(activation.activatedAt)}</TableCell>
                    <TableCell>{formatDateTime(activation.lastVerifiedAt)}</TableCell>
                    <TableCell>{activation.pluginVersion || 'N/A'}</TableCell>
                    <TableCell>
                      {activation.isActive && (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
