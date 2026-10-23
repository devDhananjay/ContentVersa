"use client";

import * as React from "react";

export type AdvertisePreviewState = {
  brand: string;
  website: string;
  adType: string;
  placements: string;
};

type AdvertisePreviewContextValue = AdvertisePreviewState & {
  setPreview: (patch: Partial<AdvertisePreviewState>) => void;
};

const AdvertisePreviewContext =
  React.createContext<AdvertisePreviewContextValue | null>(null);

const INITIAL: AdvertisePreviewState = {
  brand: "",
  website: "",
  adType: "",
  placements: "",
};

export function AdvertisePreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<AdvertisePreviewState>(INITIAL);

  const setPreview = React.useCallback((patch: Partial<AdvertisePreviewState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = React.useMemo(
    () => ({ ...state, setPreview }),
    [state, setPreview]
  );

  return (
    <AdvertisePreviewContext.Provider value={value}>
      {children}
    </AdvertisePreviewContext.Provider>
  );
}

export function useAdvertisePreview() {
  const ctx = React.useContext(AdvertisePreviewContext);
  if (!ctx) {
    throw new Error("useAdvertisePreview must be used within AdvertisePreviewProvider");
  }
  return ctx;
}
