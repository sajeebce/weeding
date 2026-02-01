import type { PluginContext, PluginLifecycle } from './types';

/**
 * Plugin lifecycle handlers
 */
export const lifecycle: PluginLifecycle = {
  /**
   * Called when the plugin is installed
   * Runs database migrations and seeds initial data
   */
  async install(context: PluginContext) {
    console.log('Installing LiveSupport Pro plugin...');

    // Create default support settings
    await context.prisma.$executeRaw`
      INSERT INTO "SupportSettings" (id, "chatWidgetEnabled", "chatWidgetPosition", "chatWidgetColor")
      VALUES ('default', true, 'bottom-right', '#2563eb')
      ON CONFLICT (id) DO NOTHING
    `;

    // Create default departments
    const departments = [
      { id: 'general', name: 'General Support', description: 'General inquiries' },
      { id: 'technical', name: 'Technical Support', description: 'Technical issues' },
      { id: 'billing', name: 'Billing', description: 'Payment and billing inquiries' },
    ];

    for (const dept of departments) {
      await context.prisma.$executeRaw`
        INSERT INTO "Department" (id, name, description, "isActive")
        VALUES (${dept.id}, ${dept.name}, ${dept.description}, true)
        ON CONFLICT (id) DO NOTHING
      `;
    }

    console.log('LiveSupport Pro plugin installed successfully');
  },

  /**
   * Called when the plugin is uninstalled
   * Cleans up plugin data if requested
   */
  async uninstall(_context: PluginContext) {
    console.log('Uninstalling LiveSupport Pro plugin...');

    // Note: We don't delete data by default to preserve customer tickets
    // Data cleanup should be optional and confirmed by admin

    console.log('LiveSupport Pro plugin uninstalled');
  },

  /**
   * Called when the plugin is enabled
   */
  async enable(context: PluginContext) {
    console.log('Enabling LiveSupport Pro plugin...');

    // Update settings to enable chat widget
    await context.prisma.$executeRaw`
      UPDATE "SupportSettings"
      SET "chatWidgetEnabled" = true
      WHERE id = 'default'
    `;

    console.log('LiveSupport Pro plugin enabled');
  },

  /**
   * Called when the plugin is disabled
   */
  async disable(context: PluginContext) {
    console.log('Disabling LiveSupport Pro plugin...');

    // Disable chat widget when plugin is disabled
    await context.prisma.$executeRaw`
      UPDATE "SupportSettings"
      SET "chatWidgetEnabled" = false
      WHERE id = 'default'
    `;

    console.log('LiveSupport Pro plugin disabled');
  },
};
