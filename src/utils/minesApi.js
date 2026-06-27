import api from '../services/axios';

/**
 * Operational mine sites (Mine collection — work permits, hazards, compliance, etc.).
 * Do not use /getallMines here; that returns CoalMine records with different IDs.
 */
export async function fetchOperationalMines() {
  const res = await api.get('/mines/getAllMines');
  const raw = res.data?.data ?? res.data ?? [];
  return Array.isArray(raw) ? raw : [];
}

export function resolveActiveMineId(mines, preferredId) {
  if (!mines?.length) return null;

  let storedId = null;
  try {
    const stored = JSON.parse(localStorage.getItem('selectedMine') || 'null');
    storedId = stored?._id || null;
  } catch {
    storedId = null;
  }

  const candidate = preferredId || storedId;
  if (candidate && mines.some((m) => String(m._id) === String(candidate))) {
    return candidate;
  }
  return mines[0]._id;
}
