import { Globe, CheckCircle, XCircle } from 'lucide-react';
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
import prisma from '@/lib/db';
import { formatDateTime } from '@/lib/utils';

async function getActivations() {
  const activations = await prisma.licenseActivation.findMany({
    take: 100,
    orderBy: { activatedAt: 'desc' },
    include: {
      license: {
        include: { product: true },
      },
    },
  });

  return activations;
}

async function getStats() {
  const [total, active, inactive] = await Promise.all([
    prisma.licenseActivation.count(),
    prisma.licenseActivation.count({ where: { isActive: true } }),
    prisma.licenseActivation.count({ where: { isActive: false } }),
  ]);

  return { total, active, inactive };
}

export default async function ActivationsPage() {
  const activations = await getActivations();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activations</h2>
        <p className="text-muted-foreground">
          View all domain activations across your licenses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Activations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold">{stats.inactive}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activations</CardTitle>
          <CardDescription>
            Showing the most recent 100 activations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activated</TableHead>
                <TableHead>Last Verified</TableHead>
                <TableHead>Plugin Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No activations yet
                  </TableCell>
                </TableRow>
              ) : (
                activations.map((activation) => (
                  <TableRow key={activation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{activation.domain}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">
                        {activation.license.licenseKey.substring(0, 16)}...
                      </code>
                    </TableCell>
                    <TableCell>{activation.license.product.name}</TableCell>
                    <TableCell>
                      <Badge variant={activation.isActive ? 'success' : 'secondary'}>
                        {activation.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(activation.activatedAt)}</TableCell>
                    <TableCell>{formatDateTime(activation.lastVerifiedAt)}</TableCell>
                    <TableCell>{activation.pluginVersion || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
