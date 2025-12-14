// All available permissions in the system
export const PERMISSIONS = {
  // User Management
  USERS_VIEW: "users.view",
  USERS_EDIT: "users.edit",
  USERS_DISABLE: "users.disable",

  // Support Tickets
  TICKETS_VIEW: "tickets.view",
  TICKETS_REPLY: "tickets.reply",
  TICKETS_ASSIGN: "tickets.assign",
  TICKETS_DELETE: "tickets.delete",

  // Blog
  BLOG_VIEW: "blog.view",
  BLOG_CREATE: "blog.create",
  BLOG_EDIT: "blog.edit",
  BLOG_DELETE: "blog.delete",

  // Services
  SERVICES_VIEW: "services.view",
  SERVICES_CREATE: "services.create",
  SERVICES_EDIT: "services.edit",
  SERVICES_DELETE: "services.delete",

  // Orders
  ORDERS_VIEW: "orders.view",
  ORDERS_EDIT: "orders.edit",
  ORDERS_REFUND: "orders.refund",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",

  // Permissions (meta)
  PERMISSIONS_VIEW: "permissions.view",
  PERMISSIONS_EDIT: "permissions.edit",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission categories for UI grouping
export const PERMISSION_CATEGORIES = {
  users: {
    label: "User Management",
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: "View users" },
      { key: PERMISSIONS.USERS_EDIT, label: "Edit users" },
      { key: PERMISSIONS.USERS_DISABLE, label: "Disable users" },
    ],
  },
  tickets: {
    label: "Support Tickets",
    permissions: [
      { key: PERMISSIONS.TICKETS_VIEW, label: "View tickets" },
      { key: PERMISSIONS.TICKETS_REPLY, label: "Reply to tickets" },
      { key: PERMISSIONS.TICKETS_ASSIGN, label: "Assign tickets" },
      { key: PERMISSIONS.TICKETS_DELETE, label: "Delete tickets" },
    ],
  },
  blog: {
    label: "Blog",
    permissions: [
      { key: PERMISSIONS.BLOG_VIEW, label: "View blog posts" },
      { key: PERMISSIONS.BLOG_CREATE, label: "Create blog posts" },
      { key: PERMISSIONS.BLOG_EDIT, label: "Edit blog posts" },
      { key: PERMISSIONS.BLOG_DELETE, label: "Delete blog posts" },
    ],
  },
  services: {
    label: "Services",
    permissions: [
      { key: PERMISSIONS.SERVICES_VIEW, label: "View services" },
      { key: PERMISSIONS.SERVICES_CREATE, label: "Create services" },
      { key: PERMISSIONS.SERVICES_EDIT, label: "Edit services" },
      { key: PERMISSIONS.SERVICES_DELETE, label: "Delete services" },
    ],
  },
  orders: {
    label: "Orders",
    permissions: [
      { key: PERMISSIONS.ORDERS_VIEW, label: "View orders" },
      { key: PERMISSIONS.ORDERS_EDIT, label: "Edit orders" },
      { key: PERMISSIONS.ORDERS_REFUND, label: "Process refunds" },
    ],
  },
  settings: {
    label: "Settings",
    permissions: [
      { key: PERMISSIONS.SETTINGS_VIEW, label: "View settings" },
      { key: PERMISSIONS.SETTINGS_EDIT, label: "Edit settings" },
    ],
  },
  permissions: {
    label: "Permissions",
    permissions: [
      { key: PERMISSIONS.PERMISSIONS_VIEW, label: "View permissions" },
      { key: PERMISSIONS.PERMISSIONS_EDIT, label: "Edit permissions" },
    ],
  },
} as const;

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS), // Admin gets all permissions

  CONTENT_MANAGER: [
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_EDIT,
  ],

  SUPPORT_AGENT: [
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_REPLY,
    PERMISSIONS.TICKETS_ASSIGN,
    PERMISSIONS.ORDERS_VIEW,
  ],

  SALES_AGENT: [
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_REPLY,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_EDIT,
  ],

  CUSTOMER: [], // Customers have no admin permissions
};

// Get all permission keys as array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Role labels for display
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  CONTENT_MANAGER: "Content Manager",
  SUPPORT_AGENT: "Support Agent",
  SALES_AGENT: "Sales Agent",
  CUSTOMER: "Customer",
};

// Editable roles (excluding CUSTOMER and ADMIN from editing)
export const EDITABLE_ROLES = ["CONTENT_MANAGER", "SUPPORT_AGENT", "SALES_AGENT"] as const;
