import { useState } from "react";
import { requestReturnOrReplacement } from "../services/returnApi";
import { useToast } from "../context/ToastContext";

export default function ReturnReplaceModal({ orderId, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const submit = async (type) => {
    if (!reason) {
      showToast("Please select a reason", "error");
      return;
    }

    try {
      setLoading(true);
      await requestReturnOrReplacement(orderId, type, reason);

      showToast(
        type === "RETURN"
          ? "Return request submitted"
          : "Replacement request submitted",
        "success"
      );

      onSuccess(); // refresh orders
      onClose();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Request failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Return / Replacement</h3>

        {/* Reason */}
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select reason</option>
          <option value="Damaged item">Damaged item</option>
          <option value="Accessory missing">Accessory missing</option>
        </select>

        {/* Buttons appear only after reason */}
        {reason && (
          <div className="modal-actions">
            <button
              disabled={loading}
              onClick={() => submit("RETURN")}
            >
              Return
            </button>

            <button
              disabled={loading}
              onClick={() => submit("REPLACEMENT")}
            >
              Replacement
            </button>
          </div>
        )}

        <button className="close-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
