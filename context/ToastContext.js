import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import ToastHost from "../components/ToastHost";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = "success") => {
    setToast({
      id: Date.now(),
      message,
      tone,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toast={toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
