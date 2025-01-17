import { createContext, useContext, useState, ReactNode } from "react";

interface PanesContextType {
  list: string[];
  addPane: () => void;
  removePane: (index: number) => void;
}

const PanesContext = createContext<PanesContextType | undefined>(undefined);

export function PanesProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Array<string>>([]);

  const addPane = () => {
    setList((prev) => [...prev, "pane number" + prev.length]);
  };

  const removePane = (index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PanesContext.Provider value={{ list, addPane, removePane }}>
      {children}
    </PanesContext.Provider>
  );
}

export function usePanes() {
  const context = useContext(PanesContext);
  if (context === undefined) {
    throw new Error("usePanes must be used within a PanesProvider");
  }
  return context;
}
