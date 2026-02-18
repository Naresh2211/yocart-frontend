import { useEffect, useState, useCallback } from "react";
import {
  getMyOrdersPaged,
  cancelOrder,
  requestRefund,
  makePayment,
} from "../services/api";
import { requestReturnOrReplacement } from "../services/returnApi";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [confirmOrderId, setConfirmOrderId] = useState(null);
  const [reason, setReason] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      const res = await getMyOrdersPaged(page, 10);
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      showToast("Failed to load orders", "error");
    }
  }, [page, showToast]);

  useEffect(() => {
    loadOrders();
    window.scrollTo(0, 0);
  }, [loadOrders]);

  const formatText = (text) =>
    text
      ? text
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";

  const openConfirm = (orderId) => {
    setConfirmOrderId(orderId);
  };

  const closeConfirm = () => {
    setConfirmOrderId(null);
  };

  const confirmCancel = async () => {
    try {
      await cancelOrder(confirmOrderId);
      showToast("Order cancelled successfully");
      closeConfirm();
      loadOrders();
    } catch {
      showToast("Failed to cancel order", "error");
      closeConfirm();
    }
  };

  const handlePayment = async (orderId, method) => {
    try {
      await makePayment({ orderId, paymentMethod: method });
      showToast("Payment successful");
      loadOrders();
    } catch {
      showToast("Payment failed", "error");
    }
  };

  const handleRefundRequest = async (orderId) => {
    try {
      await requestRefund(orderId);
      showToast("Refund request submitted", "success");
      loadOrders();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Refund request failed",
        "error"
      );
    }
  };

  const submitReturnOrReplace = async (orderId, type) => {
    if (!reason) {
      showToast("Please select a reason", "error");
      return;
    }

    try {
      await requestReturnOrReplacement(orderId, type, reason);

      showToast(
        type === "RETURN"
          ? "Return request submitted"
          : "Replacement request submitted",
        "success"
      );

      setActiveOrderId(null);
      setReason("");
      loadOrders();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Request failed",
        "error"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="page">
        <h2>My Orders</h2>

        {orders.length === 0 && (
          <p className="empty">No orders found</p>
        )}

        <div key={page} className="orders-transition">
          {orders.map((o) => {

            /* ✅ ONLY ADDITION */
            let displayStatus = o.status;

            if (
              o.returnType === "REPLACEMENT" &&
              o.returnStatus === "COMPLETED"
            ) {
              displayStatus = "REPLACEMENT_DELIVERED";
            }

            const isCancelled = displayStatus === "CANCELLED";
            const isCOD = o.paymentMethod === "COD";
            const isPaid = o.paymentStatus === "PAID";

            const isReturnCompleted =
              o.returnStatus === "COMPLETED" &&
              o.returnType === "RETURN";

            const isRefundCompleted =
              displayStatus === "CANCELLED" &&
              o.refundStatus === "REFUNDED";

            const canRequestRefund =
              isCancelled &&
              !isCOD &&
              isPaid &&
              !o.refundStatus;

            const canReturnReplace =
              displayStatus === "DELIVERED" &&
              !o.returnStatus;

            const showPaymentOptions =
              !isCancelled &&
              !o.paymentMethod &&
              (displayStatus === "PLACED" ||
                displayStatus === "CONFIRMED");

            const paymentClass =
              o.paymentMethod === "COD"
                ? "payment-cod"
                : o.paymentMethod === "UPI"
                ? "payment-upi"
                : o.paymentMethod === "CARD"
                ? "payment-card"
                : "";

            return (
              <div key={o.id} className="order-card">
                <p>
                  <strong>Order ID:</strong> {o.id}
                </p>

                {/* ✅ ONLY CHANGE HERE */}
                <p className={`status-${displayStatus}`}>
                  <strong>Status:</strong>{" "}
                  {formatText(displayStatus)}
                </p>

                {!isReturnCompleted && !isRefundCompleted && (
                  <>
                    <p className={`payment-status-${o.paymentStatus}`}>
                      <strong>Payment Status:</strong>{" "}
                      {isCOD && isCancelled
                        ? "Unpaid"
                        : formatText(o.paymentStatus)}
                    </p>

                    {o.paymentMethod && (
                      <p>
                        <strong>Payment Method:</strong>{" "}
                        <span className={paymentClass}>
                          {formatText(o.paymentMethod)}
                        </span>
                      </p>
                    )}
                  </>
                )}

                {o.returnStatus && (
                  <>
                    <p className={`return-${o.returnStatus}`}>
                      <strong>
                        {o.returnType === "RETURN"
                          ? "Return"
                          : "Replacement"}
                        :
                      </strong>{" "}
                      {formatText(o.returnStatus)}
                    </p>

                    {o.returnReason && (
                      <p className="return-reason">
                        <strong>Reason:</strong>{" "}
                        {formatText(o.returnReason)}
                      </p>
                    )}
                  </>
                )}

                {o.refundStatus && (
                  <p className={`payment-status-${o.refundStatus}`}>
                    <strong>Refund Status:</strong>{" "}
                    {formatText(o.refundStatus)}
                  </p>
                )}

                <p>
                  <strong>Placed At:</strong>{" "}
                  {new Date(o.createdAt).toLocaleString()}
                </p>

                <div className="order-items">
                  <strong>Items :</strong>
                  {o.items.map((item) => (
                    <div key={item.id} className="order-item">
                      {item.product.name}{" "}
                      <strong>[{item.quantity}]</strong> = ₹
                      {item.price * item.quantity}
                    </div>
                  ))}
                </div>

                <p className="order-total">
                  <strong>Total Amount:</strong> ₹
                  {o.totalAmount}
                </p>

                {showPaymentOptions && (
                  <div className="order-actions payment-options">
                    <p><strong>Payment Options:</strong></p>
                    <button onClick={() => handlePayment(o.id, "COD")}>
                      Cash on Delivery
                    </button>
                    <button onClick={() => handlePayment(o.id, "UPI")}>
                      UPI
                    </button>
                    <button onClick={() => handlePayment(o.id, "CARD")}>
                      Card
                    </button>
                  </div>
                )}

                {(displayStatus === "PLACED" ||
                  displayStatus === "CONFIRMED") && (
                  <div className="order-actions">
                    <button onClick={() => openConfirm(o.id)}>
                      Cancel Order
                    </button>
                  </div>
                )}

                {canRequestRefund && (
                  <div className="order-actions">
                    <button
                      className="refund-btn"
                      onClick={() =>
                        handleRefundRequest(o.id)
                      }
                    >
                      Request Refund
                    </button>
                  </div>
                )}

                {canReturnReplace && (
                  <div className="order-actions">
                    <button
                      onClick={() =>
                        setActiveOrderId(
                          activeOrderId === o.id ? null : o.id
                        )
                      }
                    >
                      Return / Replace
                    </button>
                  </div>
                )}

                {activeOrderId === o.id &&
                  canReturnReplace && (
                    <div className="order-actions">
                      <select
                        className="return-reason-select"
                        value={reason}
                        onChange={(e) =>
                          setReason(e.target.value)
                        }
                      >
                        <option value="">
                          Select reason
                        </option>
                        <option value="Damaged item">
                          Damaged item
                        </option>
                        <option value="Accessory missing">
                          Accessory missing
                        </option>
                      </select>

                      {reason && (
                        <>
                          <button
                            className="return-btn"
                            onClick={() =>
                              submitReturnOrReplace(
                                o.id,
                                "RETURN"
                              )
                            }
                          >
                            Return
                          </button>

                          <button
                            className="replace-btn"
                            onClick={() =>
                              submitReturnOrReplace(
                                o.id,
                                "REPLACEMENT"
                              )
                            }
                          >
                            Replacement
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              &lt; Prev
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={
                  page === index ? "active-page" : ""
                }
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>

      {confirmOrderId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Cancel Order</h3>
            <p>
              Are you sure you want to cancel this order?
            </p>

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
