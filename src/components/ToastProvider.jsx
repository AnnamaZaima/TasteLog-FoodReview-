import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({}); // track setTimeouts to clear them on unmount

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Math.random().toString(36).slice(2, 10);
      setToasts((ts) => [...ts, { id, message, type }]);

      if (duration) {
        timers.current[id] = setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      push,
      success: (m, d) => push(m, "success", d),
      error: (m, d) => push(m, "error", d),
      info: (m, d) => push(m, "info", d),
    }),
    [push]
  );

  // Cleanup timers when provider unmounts
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="toast-container"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button
              className="toast-close"
              onClick={() => remove(t.id)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside a <ToastProvider>");
  }
  return ctx;
};
