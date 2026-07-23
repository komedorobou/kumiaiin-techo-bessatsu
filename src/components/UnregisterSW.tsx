'use client';

import { useEffect } from 'react';

// 圏外(オフライン)機能は仕様から外した。旧デモでSWを登録済みの端末を掃除する
export default function UnregisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    }
  }, []);
  return null;
}
