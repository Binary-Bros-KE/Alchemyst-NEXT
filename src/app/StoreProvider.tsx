'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, createPersistor } from '@/lib/store';
import { fetchAllProfiles } from '@/lib/features/profiles/profilesSlice';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(fetchAllProfiles());

    // Start persistence on the client without changing the rendered tree.
    createPersistor(store);
  }, [store]);

  return (
    <Provider store={store}>{children}</Provider>
  );
}
