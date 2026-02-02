import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, CheckCircle, XCircle, Activity, DollarSign, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalLicenses: number;
    activeLicenses: number;
    expiredLicenses: number;
    suspendedLicenses: number;
    totalActivations: number;
    totalRevenue: {
      USD: number;
      BDT: number;
    };
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Licenses',
      value: stats.totalLicenses.toLocaleString(),
      icon: Key,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Licenses',
      value: stats.activeLicenses.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Revenue (USD)',
      value: `$${stats.totalRevenue.USD.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Activations',
      value: stats.totalActivations.toLocaleString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Suspended',
      value: stats.suspendedLicenses.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Expired',
      value: stats.expiredLicenses.toLocaleString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
