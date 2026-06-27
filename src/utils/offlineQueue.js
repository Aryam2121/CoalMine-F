const QUEUE_KEY = 'offlineActionQueue';

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const enqueueOfflineAction = (action) => {
  const queue = getOfflineQueue();
  queue.push({ ...action, queuedAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const flushOfflineQueue = async (apiClient) => {
  const queue = getOfflineQueue();
  if (!queue.length || !navigator.onLine) return { flushed: 0 };

  const remaining = [];
  let flushed = 0;

  for (const action of queue) {
    try {
      await apiClient({
        method: action.method || 'post',
        url: action.url,
        data: action.data,
      });
      flushed += 1;
    } catch {
      remaining.push(action);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { flushed, remaining: remaining.length };
};

export const queueOrExecute = async (apiClient, { method, url, data }) => {
  if (!navigator.onLine) {
    enqueueOfflineAction({ method, url, data });
    return { queued: true };
  }
  const res = await apiClient({ method, url, data });
  return { queued: false, data: res.data };
};

export default { getOfflineQueue, enqueueOfflineAction, flushOfflineQueue, queueOrExecute };
