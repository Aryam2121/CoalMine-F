import { useEffect, useState } from 'react';

const OfflineBanner = () => {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-amber-600 text-white text-center text-xs sm:text-sm py-1.5 px-3 z-[70] relative">
      You are offline — safety reports will queue and sync when connection returns.
    </div>
  );
};

export default OfflineBanner;
