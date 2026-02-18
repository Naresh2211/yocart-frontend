import { useEffect, useState, useCallback } from "react";
import {
  getAllReturns,
  processReturnRequest,
} from "../services/api";

import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function AdminReturns() {
  const [requests, setRequests] = useState([]);
  const { showToast } = useToast();

  const loadRequests = useCallback(async () => {
    try {
      const res = await getAllReturns();

      console.log("STATUS:", res.status);
      console.log("DATA:", res.data);

      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }

    } catch (err) {
      console.log("FULL ERROR:", err);
      showToast("Failed to load return requests", "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleProcess = async (id, type) => {
    try {
      await processReturnRequest(id);

      showToast(
        type === "RETURN"
          ? "Return processed successfully"
          : "Replacement marked as delivered",
        "success"
      );

      loadRequests();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Action failed",
        "error"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="page">
        <h2>Return / Replacement Requests</h2>

        {requests.length === 0 && (
          <p className="empty">No requests found</p>
        )}

        {requests.map((r) => (
          <div key={r.id} className="order-card admin-order-card">

            <p><strong>Order ID:</strong> {r.orderId}</p>
            <p><strong>User:</strong> {r.userEmail}</p>

            <p>
              <strong>Type:</strong>{" "}
              <span className={
                r.type === "RETURN"
                  ? "refund-PENDING"
                  : "status-CONFIRMED"
              }>
                {r.type}
              </span>
            </p>

            <p><strong>Reason:</strong> {r.reason}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={
                r.status === "REQUESTED"
                  ? "refund-PENDING"
                  : "refund-REFUNDED"
              }>
                {r.status}
              </span>
            </p>

            <p>
              <strong>Requested At:</strong>{" "}
              {r.requestedAt
                ? new Date(r.requestedAt).toLocaleString()
                : "N/A"}
            </p>

            {r.status === "REQUESTED" && (
              <div className="order-actions">
                <button onClick={() => handleProcess(r.id, r.type)}>
                  {r.type === "RETURN"
                    ? "Mark Return Received"
                    : "Send Replacement"}
                </button>
              </div>
            )}

          </div>
        ))}
      </div>
    </>
  );
}
