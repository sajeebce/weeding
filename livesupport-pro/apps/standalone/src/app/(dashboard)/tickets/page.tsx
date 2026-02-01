'use client';

import { useState } from 'react';

const mockTickets = [
  { id: '1', ticketNumber: 'SUP-20240115-A1B2', subject: 'Cannot access my account', customer: 'John Doe', status: 'OPEN', priority: 'HIGH', createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', ticketNumber: 'SUP-20240115-C3D4', subject: 'Payment not processed', customer: 'Jane Smith', status: 'WAITING_FOR_CUSTOMER', priority: 'URGENT', createdAt: '2024-01-15T09:30:00Z' },
  { id: '3', ticketNumber: 'SUP-20240114-E5F6', subject: 'Feature request: Dark mode', customer: 'Mike Johnson', status: 'OPEN', priority: 'LOW', createdAt: '2024-01-14T15:00:00Z' },
];

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  WAITING_FOR_CUSTOMER: 'bg-yellow-100 text-yellow-800',
  WAITING_FOR_AGENT: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'text-gray-500',
  NORMAL: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
};

export default function TicketsPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <input
            type="text"
            placeholder="Search tickets..."
            className="flex-1 border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-600">Ticket</th>
              <th className="text-left p-4 font-medium text-gray-600">Customer</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Priority</th>
              <th className="text-left p-4 font-medium text-gray-600">Created</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((ticket) => (
              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-900">{ticket.subject}</p>
                  <p className="text-sm text-gray-500 font-mono">{ticket.ticketNumber}</p>
                </td>
                <td className="p-4 text-gray-600">{ticket.customer}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[ticket.status]}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-medium ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
