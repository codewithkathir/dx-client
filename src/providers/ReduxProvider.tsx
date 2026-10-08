'use client';

import { Provider } from 'react-redux';

import { makeStore } from '@/store';
import { useState } from 'react';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
