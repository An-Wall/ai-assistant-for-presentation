import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface GlassToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function GlassToast({ toast, onDismiss }: GlassToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`
        w-80 p-4 rounded-xl border border-white/30
        transition-all duration-300
        ${isLeaving ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}
      `}
      style={{
        background: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <p className="flex-1 text-black font-medium">{toast.message || '알림'}</p>
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          className="shrink-0 text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <GlassToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
