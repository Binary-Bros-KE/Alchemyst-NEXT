'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, createPersistor } from '@/lib/store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // Start persistence on the client without changing the rendered tree.
    createPersistor(storeRef.current as AppStore);
  }, []);

  return (
    <Provider store={storeRef.current}>{children}</Provider>
  );
}
