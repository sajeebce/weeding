import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmailSettingsPage() {
  const hasResendKey = !!process.env.RESEND_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email Settings</h2>
        <p className="text-muted-foreground">
          Configure email notifications and templates
        </p>
      </div>

      {/* Email Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Provider
          </CardTitle>
          <CardDescription>
            Configuration status for transactional emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium">Resend</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API Key</span>
            <Badge variant={hasResendKey ? 'success' : 'destructive'}>
              {hasResendKey ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">From Address</span>
            <span className="font-mono text-sm">
              {process.env.EMAIL_FROM || 'Not configured'}
            </span>
          </div>
          {!hasResendKey && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
              <p>
                Email sending is disabled. Add <code>RESEND_API_KEY</code> to your
                environment variables to enable email notifications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Templates used for automatic email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">License Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Sent when a new license is generated
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Active</Badge>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">License Expiring Soon</p>
                <p className="text-sm text-muted-foreground">
                  Reminder sent 7 days before expiration
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Disabled</Badge>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Support Expiring Soon</p>
                <p className="text-sm text-muted-foreground">
                  Reminder sent 30 days before support expires
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Disabled</Badge>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">License Suspended</p>
                <p className="text-sm text-muted-foreground">
                  Notification when license is suspended
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Active</Badge>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
          <CardDescription>
            Send a test email to verify your configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="test@example.com"
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            />
            <Button disabled={!hasResendKey}>
              Send Test Email
            </Button>
          </div>
          {!hasResendKey && (
            <p className="mt-2 text-sm text-muted-foreground">
              Configure your email provider first to send test emails.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
