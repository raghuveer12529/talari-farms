/**
 * Role-based access control for the ERP.
 * Mirrors the Prisma `Role` enum. PARTNER is the legacy ledger role and has
 * no ERP access.
 */
export type Role =
  | 'ADMIN'
  | 'MANAGER'
  | 'SALES'
  | 'ACCOUNTS'
  | 'INVENTORY'
  | 'VIEWER'
  | 'PARTNER';

export type ErpModule =
  | 'dashboard'
  | 'customers'
  | 'products'
  | 'inventory'
  | 'invoices'
  | 'payments'
  | 'settings';

export type Action = 'view' | 'manage';

/** Modules each role may *manage* (create/edit/delete). `view` is derived below. */
const MANAGE: Record<Role, ErpModule[] | '*'> = {
  ADMIN: '*',
  MANAGER: ['dashboard', 'customers', 'products', 'inventory', 'invoices', 'payments'],
  SALES: ['customers', 'products', 'invoices'],
  ACCOUNTS: ['invoices', 'payments', 'customers'],
  INVENTORY: ['products', 'inventory'],
  VIEWER: [],
  PARTNER: [],
};

/** Roles that may view (read) the ERP at all. PARTNER cannot. */
const ERP_ROLES: Role[] = ['ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS', 'INVENTORY', 'VIEWER'];

export function hasErpAccess(role: Role): boolean {
  return ERP_ROLES.includes(role);
}

export function can(role: Role, module: ErpModule, action: Action = 'view'): boolean {
  if (!hasErpAccess(role)) return false;

  if (action === 'view') {
    // Anyone with ERP access can view every module (read-only for VIEWER).
    return true;
  }

  const manage = MANAGE[role];
  if (manage === '*') return true;
  return manage.includes(module);
}

/** Convenience for server actions: throw if the role cannot manage a module. */
export function assertCan(role: Role, module: ErpModule, action: Action = 'manage'): void {
  if (!can(role, module, action)) {
    throw new Error(`Forbidden: ${role} cannot ${action} ${module}`);
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES: 'Sales',
  ACCOUNTS: 'Accounts',
  INVENTORY: 'Inventory',
  VIEWER: 'Viewer',
  PARTNER: 'Partner',
};
