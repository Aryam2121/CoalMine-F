import { MENU_SECTIONS } from './roles';

const EXTRA = [
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
  { to: '/safety-check-in', label: 'Safety Check-In' },
];

export const getSearchableRoutes = () => {
  const routes = [];
  MENU_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      routes.push({ to: item.to, label: item.label, section: section.label });
    });
  });
  EXTRA.forEach((item) => routes.push({ ...item, section: 'Account' }));
  return routes;
};

export const searchRoutes = (query, routes = getSearchableRoutes()) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return routes.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q)
  );
};

export default { getSearchableRoutes, searchRoutes };
