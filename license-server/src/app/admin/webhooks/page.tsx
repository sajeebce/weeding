import { Webhook, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
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

const statusColors: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  SUCCESS: 'success',
  FAILED: 'destructive',
  PENDING: 'warning',
  PROCESSING: 'secondary',
  IGNORED: 'secondary',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  SUCCESS: CheckCircle,
  FAILED: XCircle,
  PENDING: Clock,
  PROCESSING: Clock,
  IGNORED: AlertTriangle,
};

async function getWebhookLogs() {
  const logs = await prisma.webhookLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  return logs;
}

async function getStats() {
  const [total, success, failed, pending] = await Promise.all([
    prisma.webhookLog.count(),
    prisma.webhookLog.count({ where: { status: 'SUCCESS' } }),
    prisma.webhookLog.count({ where: { status: 'FAILED' } }),
    prisma.webhookLog.count({ where: { status: 'PENDING' } }),
  ]);

  return { total, success, failed, pending };
}

export default async function WebhooksPage() {
  const logs = await getWebhookLogs();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Webhooks</h2>
        <p className="text-muted-foreground">
          Monitor webhook events from CodeCanyon, Gumroad, and other sources
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{stats.success}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold">{stats.failed}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CodeCanyon (Envato)</CardTitle>
            <CardDescription>
              Configure Envato webhook for automatic license generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Webhook URL</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  {process.env.NEXTAUTH_URL || 'https://license.llcpad.com'}/api/webhooks/envato
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Add this URL to your Envato webhook settings
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gumroad</CardTitle>
            <CardDescription>
              Configure Gumroad ping for automatic license generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Webhook URL</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  {process.env.NEXTAUTH_URL || 'https://license.llcpad.com'}/api/webhooks/gumroad
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Add this URL to your Gumroad ping settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Logs</CardTitle>
          <CardDescription>
            Recent webhook events and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>License ID</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Processed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No webhook events yet
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const StatusIcon = statusIcons[log.status];
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.source}</Badge>
                      </TableCell>
                      <TableCell>{log.eventType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={statusColors[log.status]}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.licenseId ? (
                          <code className="text-xs">{log.licenseId.substring(0, 8)}...</code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        {log.processedAt ? formatDateTime(log.processedAt) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
