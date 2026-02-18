import { useEffect } from "react";
import "./Toast.css";

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast-overlay">
      <div className={`toast toast-${type}`}>
        {message}
      </div>
    </div>
  );
}
