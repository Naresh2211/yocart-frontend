import { useEffect, useState, useCallback } from "react";
import {
  getAllAdminOrders,
  shipOrder,
  deliverOrder,
  adminCancelOrder,
} from "../services/api";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOrderId, setConfirmOrderId] = useState(null);
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      const res = await getAllAdminOrders(0, 100);
      const data = res?.data?.content || [];
      setOrders(data);
    } catch {
      showToast("Failed to load admin orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleShip = async (orderId) => {
    try {
      await shipOrder(orderId);
      showToast("Order shipped successfully");
      loadOrders();
    } catch {
      showToast("Failed to ship order", "error");
    }
  };

  const handleDeliver = async (orderId) => {
    try {
      await deliverOrder(orderId);
      showToast("Order delivered successfully");
      loadOrders();
    } catch {
      showToast("Failed to deliver order", "error");
    }
  };

  const openConfirm = (orderId) => {
    setConfirmOrderId(orderId);
  };

  const closeConfirm = () => {
    setConfirmOrderId(null);
  };

  const confirmCancel = async () => {
    try {
      await adminCancelOrder(confirmOrderId);
      showToast("Order cancelled successfully");
      closeConfirm();
      loadOrders();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Cancel failed",
        "error"
      );
      closeConfirm();
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

      <div className="page admin-orders-page">
        <h2>Admin Orders</h2>

        {loading && <p>Loading...</p>}

        {!loading && orders.length === 0 && (
          <p className="empty">No orders found</p>
        )}

        {orders.map((o) => {
          const orderStatus = o.orderStatus || o.status;

          const hasReturnFlow =
            o.returnStatus === "REQUESTED" ||
            o.returnStatus === "COMPLETED";

          const canCancel =
            orderStatus !== "DELIVERED" &&
            orderStatus !== "CANCELLED" &&
            !hasReturnFlow;

          const showRefund =
            orderStatus === "CANCELLED" &&
            o.paymentStatus === "PAID";

          const refundCompleted =
            o.refundStatus === "REFUNDED";

          return (
            <div
              key={o.orderId}
              className="order-card admin-order-card"
            >
              <p><strong>Order ID:</strong> {o.orderId}</p>

              <p><strong>User:</strong> {getUsername(o.userEmail)}</p>

              {/* ORDER STATUS */}
              <p className={`status-${orderStatus}`}>
                <strong>Status:</strong>{" "}
                {formatStatus(orderStatus)}
              </p>

              {/* PAYMENT STATUS */}
              <p className={`payment-status-${o.paymentStatus}`}>
                <strong>Payment Status:</strong>{" "}
                {formatStatus(o.paymentStatus)}
              </p>

              {/* PAYMENT METHOD */}
              {o.paymentMethod && (
                <p>
                  <strong>Payment Method:</strong>{" "}
                  <span
                    className={`payment-${o.paymentMethod?.toLowerCase()}`}
                  >
                    {formatStatus(o.paymentMethod)}
                  </span>
                </p>
              )}

              {/* RETURN FLOW */}
              {o.returnStatus && (
                <>
                  <p
                    className={`return-${o.returnStatus}`}
                  >
                    <strong>Return:</strong>{" "}
                    {formatStatus(o.returnStatus)}
                  </p>

                  {o.returnReason && (
                    <p className="return-reason">
                      <strong>Reason:</strong>{" "}
                      {formatStatus(o.returnReason)}
                    </p>
                  )}
                </>
              )}

              {/* REFUND STATUS */}
              {showRefund && (
                <p
                  className={
                    refundCompleted
                      ? "refund-status refund-REFUNDED"
                      : "refund-status refund-PENDING"
                  }
                >
                  <strong>Refund:</strong>{" "}
                  {refundCompleted ? "Completed" : "Pending"}
                </p>
              )}

              <p><strong>Total:</strong> ₹{o.totalAmount}</p>

              <p>
                <strong>Placed At:</strong>{" "}
                {new Date(o.createdAt).toLocaleString()}
              </p>

              <div className="order-actions admin-order-actions">
                {(orderStatus === "PLACED" ||
                  orderStatus === "CONFIRMED") && (
                  <button onClick={() => handleShip(o.orderId)}>
                    Ship
                  </button>
                )}

                {orderStatus === "SHIPPED" && (
                  <button onClick={() => handleDeliver(o.orderId)}>
                    Deliver
                  </button>
                )}

                {canCancel && (
                  <button
                    className="admin-cancel-btn"
                    onClick={() => openConfirm(o.orderId)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRM MODAL */}
      {confirmOrderId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>

            <div className="confirm-actions">
              <button
                className="confirm-yes"
                onClick={confirmCancel}
              >
                Yes
              </button>

              <button
                className="confirm-no"
                onClick={closeConfirm}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
