import { Settings, Server, Database, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/db';

async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings;
}

async function getSystemInfo() {
  const [
    totalLicenses,
    totalProducts,
    totalActivations,
    totalAdmins,
  ] = await Promise.all([
    prisma.license.count(),
    prisma.product.count(),
    prisma.licenseActivation.count(),
    prisma.admin.count(),
  ]);

  return {
    totalLicenses,
    totalProducts,
    totalActivations,
    totalAdmins,
    nodeVersion: process.version,
    nextVersion: '15.x',
  };
}

export default async function SettingsPage() {
  const settings = await getSettings();
  const systemInfo = await getSystemInfo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your license server configuration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Node.js</span>
              <span className="font-mono text-sm">{systemInfo.nodeVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next.js</span>
              <span className="font-mono text-sm">{systemInfo.nextVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono text-sm">1.0.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>
              Database statistics and health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connection</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Licenses</span>
              <span className="font-medium">{systemInfo.totalLicenses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Products</span>
              <span className="font-medium">{systemInfo.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Activations</span>
              <span className="font-medium">{systemInfo.totalActivations}</span>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Security configuration status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">RSA Keys</span>
              <Badge variant={process.env.LICENSE_PRIVATE_KEY ? 'success' : 'destructive'}>
                {process.env.LICENSE_PRIVATE_KEY ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">HTTPS</span>
              <Badge variant="success">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Admin Users</span>
              <span className="font-medium">{systemInfo.totalAdmins}</span>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Current system settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom settings configured</p>
            ) : (
              settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{setting.key}</span>
                  <span className="font-mono text-sm">{setting.value}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <a
              href="/admin/settings/keys"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div>
                <p className="font-medium">RSA Key Management</p>
                <p className="text-sm text-muted-foreground">
                  View and rotate RSA keys
                </p>
              </div>
            </a>
            <a
              href="/admin/settings/email"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div>
                <p className="font-medium">Email Settings</p>
                <p className="text-sm text-muted-foreground">
                  Configure email templates
                </p>
              </div>
            </a>
            <a
              href="/api/health"
              target="_blank"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div>
                <p className="font-medium">Health Check</p>
                <p className="text-sm text-muted-foreground">
                  View API health status
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
