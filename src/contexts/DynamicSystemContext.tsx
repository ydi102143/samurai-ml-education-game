// 動的システムのコンテキスト

import { createContext, useContext, useState, ReactNode } from 'react';

interface DynamicSystemContextType {
  useDynamicSystem: boolean;
  setUseDynamicSystem: (use: boolean) => void;
}

const DynamicSystemContext = createContext<DynamicSystemContextType | undefined>(undefined);

export function DynamicSystemProvider({ children }: { children: ReactNode }) {
  const [useDynamicSystem, setUseDynamicSystem] = useState(false);

  return (
    <DynamicSystemContext.Provider value={{ useDynamicSystem, setUseDynamicSystem }}>
      {children}
    </DynamicSystemContext.Provider>
  );
}

export function useDynamicSystemContext() {
  const context = useContext(DynamicSystemContext);
  if (context === undefined) {
    throw new Error('useDynamicSystemContext must be used within a DynamicSystemProvider');
  }
  return context;
}
