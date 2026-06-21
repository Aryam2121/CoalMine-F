/**
 * Role configuration — keep in sync with CoalMine-B/config/roles.js
 */

export const ROLES = {
  WORKER: 'worker',
  INSPECTOR: 'Inspector',
  SAFETY_MANAGER: 'Safety Manager',
  SHIFT_INCHARGE: 'Shift Incharge',
  MINE_ADMIN: 'Mine admin',
  SUPER_ADMIN: 'Super admin',
};

/** Sidebar menu — single source for navigation + access filtering */
export const MENU_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { to: '/', label: 'Dashboard' },
      { to: '/live-operations', label: 'Live Ops', minTier: 'manager' },
      { to: '/coal-mines', label: 'Coal Mines', minTier: 'manager' },
      { to: '/shift-logs', label: 'Shift Logs' },
      { to: '/attendance', label: 'Attendance' },
      { to: '/safety-check-in', label: 'Safety Check-In' },
      { to: '/maintenance', label: 'Maintenance', minTier: 'manager' },
      { to: '/team-chat', label: 'Team Chat' },
    ],
  },
  {
    label: 'Safety',
    items: [
      { to: '/safety-plan', label: 'Safety Plan', minTier: 'manager' },
      { to: '/alerts', label: 'Alerts' },
      { to: '/emergency', label: 'Emergency' },
      { to: '/safety-report', label: 'Safety Reports' },
      { to: '/capa', label: 'CAPA' },
      { to: '/compliance-reports', label: 'Compliance Reports', minTier: 'manager' },
      { to: '/compliance-center', label: 'Compliance Center', minTier: 'manager' },
      { to: '/training', label: 'Training' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { to: '/resources', label: 'Resources', minTier: 'manager' },
      { to: '/inventory', label: 'Inventory', minTier: 'manager' },
      { to: '/weather', label: 'Weather' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/executive', label: 'Executive', minTier: 'manager' },
      { to: '/predictive-analytics', label: 'AI Analytics', minTier: 'manager' },
      { to: '/predictive-maintenance', label: 'Predictive Maint.', minTier: 'manager' },
      { to: '/data-visualization', label: 'Analytics', minTier: 'manager' },
      { to: '/report-generation', label: 'Reports', minTier: 'manager' },
      { to: '/audit-logs', label: 'Audit Logs', minTier: 'admin' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/achievements', label: 'Achievements' },
      { to: '/chatbot', label: 'AI Assistant' },
    ],
  },
  {
    label: 'Admin',
    items: [{ to: '/user-management', label: 'Users', minTier: 'admin' }],
  },
];

const EXTRA_ROUTES = [
  { paths: ['/profile', '/settings'], minTier: 'all' },
  { paths: ['/safety-protocol', '/voicedictation', '/weatherquiz', '/notificationsfire'], minTier: 'all' },
];

export const ROLE_CATALOG = [
  {
    value: ROLES.WORKER,
    label: 'Worker',
    signup: true,
    tier: 'worker',
    description: 'Frontline staff — log shifts, report hazards, and use safety tools.',
    access: [
      'Dashboard & weather',
      'Shift logs & own attendance',
      'Alerts & emergency SOS',
      'Submit safety reports',
      'Training & achievements',
      'AI assistant',
    ],
  },
  {
    value: ROLES.INSPECTOR,
    label: 'Inspector',
    signup: true,
    tier: 'manager',
    description: 'Inspections, compliance checks, and safety oversight.',
    access: [
      'Everything workers can do',
      'Coal mines & safety plans',
      'Compliance reports',
      'Resources & inventory',
      'Team attendance (all staff)',
      'Analytics, reports & AI insights',
    ],
  },
  {
    value: ROLES.SAFETY_MANAGER,
    label: 'Safety Manager',
    signup: true,
    tier: 'manager',
    description: 'Manage safety plans, approve reports, and run emergency response.',
    access: [
      'Everything workers can do',
      'Approve safety reports & alerts',
      'Compliance & safety plans',
      'Emergency management',
      'Resources, analytics & exports',
      'Full team attendance',
    ],
  },
  {
    value: ROLES.SHIFT_INCHARGE,
    label: 'Shift Incharge',
    signup: true,
    tier: 'manager',
    description: 'Shift handover, roll call, and operational control.',
    access: [
      'Everything workers can do',
      'Coal mine operations',
      'Shift & attendance for all staff',
      'Resources & inventory',
      'Safety plans & compliance',
      'Analytics & operational reports',
    ],
  },
  {
    value: ROLES.MINE_ADMIN,
    label: 'Mine Admin',
    signup: false,
    tier: 'admin',
    description: 'Full mine administration — assigned by administrators only.',
    access: ['All manager features', 'User management', 'Audit logs', 'System-wide settings'],
  },
  {
    value: ROLES.SUPER_ADMIN,
    label: 'Super Admin',
    signup: false,
    tier: 'admin',
    description: 'Platform-wide control — assigned by super administrators only.',
    access: ['Full access to every module', 'User management', 'Audit logs'],
  },
];

export const SIGNUP_ROLES = ROLE_CATALOG.filter((r) => r.signup).map((r) => r.value);

export const normalizeRole = (role) => (role || ROLES.WORKER).toLowerCase().trim();

const ADMIN_SET = new Set([
  normalizeRole(ROLES.SUPER_ADMIN),
  normalizeRole(ROLES.MINE_ADMIN),
  'admin',
]);

const MANAGER_SET = new Set([
  ...ADMIN_SET,
  normalizeRole(ROLES.SAFETY_MANAGER),
  normalizeRole(ROLES.SHIFT_INCHARGE),
  normalizeRole(ROLES.INSPECTOR),
]);

export const isAdmin = (role) => ADMIN_SET.has(normalizeRole(role));
export const isManager = (role) => MANAGER_SET.has(normalizeRole(role));

export const getRoleInfo = (role) =>
  ROLE_CATALOG.find((r) => normalizeRole(r.value) === normalizeRole(role)) ||
  ROLE_CATALOG[0];

const tierLevel = (role) => {
  if (isAdmin(role)) return 3;
  if (isManager(role)) return 2;
  return 1;
};

const minTierLevel = (minTier) => {
  if (minTier === 'admin') return 3;
  if (minTier === 'manager') return 2;
  return 1;
};

/** Can this role open this path? Unknown paths are denied. */
export const canAccessPath = (role, pathname) => {
  const path = (pathname || '').toLowerCase().split('?')[0].replace(/\/$/, '') || '/';
  const level = tierLevel(role);

  for (const section of MENU_SECTIONS) {
    for (const item of section.items) {
      const to = item.to.toLowerCase();
      if (path === to || (to !== '/' && path.startsWith(`${to}/`))) {
        const required = minTierLevel(item.minTier || 'all');
        return level >= required;
      }
    }
  }

  for (const rule of EXTRA_ROUTES) {
    if (rule.paths.some((p) => path === p || path.startsWith(`${p}/`))) {
      return level >= minTierLevel(rule.minTier || 'all');
    }
  }

  return false;
};

export const filterMenuForRole = (sections, role) => {
  const r = role || ROLES.WORKER;
  return sections
    .map((section) => {
      if (section.label === 'Admin' && !isAdmin(r)) return null;
      const items = section.items.filter((item) => canAccessPath(r, item.to));
      if (!items.length) return null;
      return { ...section, items };
    })
    .filter(Boolean);
};

/** Labels of pages this role can open (for signup / access denied) */
export const getRoleAccessList = (role) => {
  const r = role || ROLES.WORKER;
  const info = getRoleInfo(r);
  if (info.access?.length) return info.access;

  const labels = [];
  for (const section of filterMenuForRole(MENU_SECTIONS, r)) {
    section.items.forEach((item) => labels.push(item.label));
  }
  labels.push('Profile', 'Settings');
  return labels;
};

export const PERMISSIONS = {
  USER_MANAGE: 'user:manage',
  AUDIT_READ: 'audit:read',
  ATTENDANCE_MANAGE_ALL: 'attendance:manage_all',
  ATTENDANCE_MARK_SELF: 'attendance:mark_self',
  SAFETY_REPORT_APPROVE: 'safety_report:approve',
  SAFETY_REPORT_CREATE: 'safety_report:create',
  SAFETY_PLAN_CREATE: 'safety_plan:create',
  SAFETY_PLAN_DELETE: 'safety_plan:delete',
  ALERT_CREATE: 'alert:create',
  ALERT_RESOLVE: 'alert:resolve',
  ALERT_RESOLVE_ALL: 'alert:resolve_all',
  COMPLIANCE_WRITE: 'compliance:write',
  COAL_MINE_WRITE: 'coal_mine:write',
  SHIFT_LOG_CREATE: 'shift_log:create',
  EMERGENCY_SOS: 'emergency:sos',
  EMERGENCY_MANAGE: 'emergency:manage',
  DASHBOARD_MAINTENANCE: 'dashboard:maintenance',
  RESOURCE_MANAGE: 'resource:manage',
  ANALYTICS_VIEW: 'analytics:view',
  NOTIFICATION_SEND: 'notification:send',
};

const PERMISSION_MAP = {
  [PERMISSIONS.USER_MANAGE]: (r) => isAdmin(r),
  [PERMISSIONS.AUDIT_READ]: (r) => isAdmin(r),
  [PERMISSIONS.ATTENDANCE_MANAGE_ALL]: (r) => isManager(r),
  [PERMISSIONS.ATTENDANCE_MARK_SELF]: () => true,
  [PERMISSIONS.SAFETY_REPORT_APPROVE]: (r) => isManager(r),
  [PERMISSIONS.SAFETY_REPORT_CREATE]: () => true,
  [PERMISSIONS.SAFETY_PLAN_CREATE]: (r) => isManager(r),
  [PERMISSIONS.SAFETY_PLAN_DELETE]: (r) => isManager(r),
  [PERMISSIONS.ALERT_CREATE]: (r) => isManager(r) || normalizeRole(r) === normalizeRole(ROLES.WORKER),
  [PERMISSIONS.ALERT_RESOLVE]: (r) => isManager(r),
  [PERMISSIONS.ALERT_RESOLVE_ALL]: (r) => isAdmin(r) || normalizeRole(r) === normalizeRole(ROLES.SAFETY_MANAGER),
  [PERMISSIONS.COMPLIANCE_WRITE]: (r) => isManager(r),
  [PERMISSIONS.COAL_MINE_WRITE]: (r) =>
    isAdmin(r) || normalizeRole(r) === normalizeRole(ROLES.SHIFT_INCHARGE),
  [PERMISSIONS.SHIFT_LOG_CREATE]: () => true,
  [PERMISSIONS.EMERGENCY_SOS]: () => true,
  [PERMISSIONS.EMERGENCY_MANAGE]: (r) => isManager(r),
  [PERMISSIONS.DASHBOARD_MAINTENANCE]: (r) => isManager(r),
  [PERMISSIONS.RESOURCE_MANAGE]: (r) => isManager(r),
  [PERMISSIONS.ANALYTICS_VIEW]: (r) => isManager(r),
  [PERMISSIONS.NOTIFICATION_SEND]: (r) => isManager(r),
};

export const hasPermission = (role, permission) => {
  const fn = PERMISSION_MAP[permission];
  return fn ? fn(role) : false;
};

/** Permissions enforced on the API — use server list from /auth/me when present */
export const SERVER_SYNCED_PERMISSIONS = new Set([
  PERMISSIONS.USER_MANAGE,
  PERMISSIONS.AUDIT_READ,
  PERMISSIONS.ATTENDANCE_MANAGE_ALL,
  PERMISSIONS.SAFETY_REPORT_APPROVE,
  PERMISSIONS.SAFETY_PLAN_CREATE,
  PERMISSIONS.SAFETY_PLAN_DELETE,
  PERMISSIONS.ALERT_CREATE,
  PERMISSIONS.ALERT_RESOLVE,
  PERMISSIONS.ALERT_RESOLVE_ALL,
  PERMISSIONS.COMPLIANCE_WRITE,
  PERMISSIONS.COAL_MINE_WRITE,
  PERMISSIONS.EMERGENCY_MANAGE,
  PERMISSIONS.DASHBOARD_MAINTENANCE,
  PERMISSIONS.RESOURCE_MANAGE,
  PERMISSIONS.ANALYTICS_VIEW,
  PERMISSIONS.NOTIFICATION_SEND,
]);

export const getRoleBadgeClass = (role) => {
  if (isAdmin(role)) return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  if (isManager(role)) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};
