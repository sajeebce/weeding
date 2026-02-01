'use client';

import type { PluginContext } from '../types';

interface AdminDashboardProps {
  context: PluginContext;
}

/**
 * Admin dashboard component for LiveSupport Pro
 * Displays key metrics and recent activity
 */
export function AdminDashboard({ context: _context }: AdminDashboardProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Open Tickets"
          value="24"
          change="+12%"
          icon="ticket"
          color="blue"
        />
        <StatCard
          title="Active Chats"
          value="8"
          subtitle="3 waiting"
          icon="chat"
          color="green"
        />
        <StatCard
          title="Avg. Response"
          value="2.4h"
          change="-18%"
          icon="clock"
          color="yellow"
        />
        <StatCard
          title="Satisfaction"
          value="94%"
          change="+2%"
          icon="smile"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View All Tickets
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Open Live Chat
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Manage Knowledge Base
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
          <div className="space-y-4">
            <ActivityItem
              title="Cannot access my account"
              subtitle="John Doe - 2 hours ago"
              status="Pending"
              statusColor="yellow"
            />
            <ActivityItem
              title="Payment issue"
              subtitle="Jane Smith - 3 hours ago"
              status="In Progress"
              statusColor="blue"
            />
            <ActivityItem
              title="Feature request"
              subtitle="Mike Johnson - 5 hours ago"
              status="Open"
              statusColor="gray"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Agents</h2>
          <div className="space-y-4">
            <AgentItem name="Sarah Johnson" status="online" chats={3} />
            <AgentItem name="Mike Chen" status="away" chats={1} />
            <AgentItem name="Emily Davis" status="online" chats={4} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, change, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-lg">{getIcon(icon)}</span>
        </div>
      </div>
      {change && (
        <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last week
        </p>
      )}
      {subtitle && (
        <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  subtitle: string;
  status: string;
  statusColor: 'yellow' | 'blue' | 'green' | 'gray';
}

function ActivityItem({ title, subtitle, status, statusColor }: ActivityItemProps) {
  const statusClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[statusColor]}`}>
        {status}
      </span>
    </div>
  );
}

interface AgentItemProps {
  name: string;
  status: 'online' | 'away' | 'offline';
  chats: number;
}

function AgentItem({ name, status, chats }: AgentItemProps) {
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-600">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`} />
      </div>
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">Handling {chats} chats</p>
      </div>
    </div>
  );
}

function getIcon(name: string): string {
  const icons: Record<string, string> = {
    ticket: '🎫',
    chat: '💬',
    clock: '⏱️',
    smile: '😊',
  };
  return icons[name] || '📊';
}
