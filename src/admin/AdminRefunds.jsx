import { useEffect, useState, useCallback } from "react";
import { getAllRefunds, completeRefund } from "../services/api";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadRefunds = useCallback(async () => {
    try {
      const res = await getAllRefunds();
      setRefunds(res.data || []);
    } catch {
      showToast("Failed to load refunds", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const handleComplete = async (refundId) => {
    try {
      await completeRefund(refundId);
      showToast("Refund completed successfully", "success");
      loadRefunds();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to complete refund",
        "error"
      );
    }
  };

  const getUsername = (email) =>
    email?.split("@")[0] || "";

  const formatStatus = (value) =>
    value
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <Navbar />

      <div className="page admin-refunds-page">
        <h2>Refund Requests</h2>

        {loading && <p>Loading...</p>}

        {!loading && refunds.length === 0 && (
          <p className="empty">No refund requests</p>
        )}

        {refunds.map((r) => (
          <div
            key={r.id}
            className="order-card admin-refund-card"
          >
            <p>
              <strong>Order ID:</strong> {r.order?.id}
            </p>

            {/* ✅ FIXED USER DISPLAY */}
            <p>
              <strong>User:</strong> {getUsername(r.userEmail)}
            </p>

            <p>
              <strong>Amount:</strong> ₹{r.amount}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`refund-${r.status}`}>
                {formatStatus(r.status)}
              </span>
            </p>

            {r.status === "REQUESTED" && (
              <div className="order-actions admin-refund-actions">
                <button onClick={() => handleComplete(r.id)}>
                  Complete Refund
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
