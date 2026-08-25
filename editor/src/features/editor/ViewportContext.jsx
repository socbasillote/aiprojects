import { createContext, useContext } from "react";

const ViewportContext = createContext(null);

export function ViewportProvider({ children, value }) {
  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  const context = useContext(ViewportContext);

  if (!context) {
    throw new Error("useViewport must be used inside ViewportProvider");
  }

  return context;
}
