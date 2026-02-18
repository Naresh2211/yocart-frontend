  import { useEffect, useState } from "react";
  import {
    getCart,
    removeCartItem,
    placeOrder,
    updateCartQuantity,
  } from "../services/api";
  import Navbar from "../components/Navbar";
  import { useToast } from "../context/ToastContext";

  export default function Cart() {
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    const { showToast } = useToast();

    const loadCart = async () => {
      const res = await getCart();
      setItems(res.data || []);
    };

    useEffect(() => {
      loadCart();
    }, []);

    const toggleSelect = (id) => {
      setSelectedIds((prev) =>
        prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id]
      );
    };

    const changeQty = async (item, delta) => {
      const newQty = item.quantity + delta;
      if (newQty < 1) return;

      try {
        setLoadingId(item.id);
        await updateCartQuantity(item.id, newQty);
        await loadCart();
        showToast("Quantity updated");
      } catch {
        showToast("Quantity update failed", "error");
      } finally {
        setLoadingId(null);
      }
    };

    const handleRemove = async (id) => {
      try {
        await removeCartItem(id);
        await loadCart();
        showToast("Item removed from cart");
      } catch {
        showToast("Remove failed", "error");
      }
    };

    const handleCheckout = async () => {
      if (selectedIds.length === 0) {
        showToast("Select items to checkout", "warning");
        return;
      }

      try {
        await placeOrder({ cartItemIds: selectedIds });
        setSelectedIds([]);
        await loadCart();
        showToast("Order placed successfully");
      } catch {
        showToast("Checkout failed", "error");
      }
    };

    return (
      <>
        <Navbar />

        <div className="page">
          <h2>Cart</h2>

          {items.length === 0 && (
            <p className="empty">Your cart is empty</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="cart-card">
              <div className="cart-row">
                <div className="cart-left">
                  <input
                    type="checkbox" className="cart-checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />

                  <div className="cart-info">
                    <div className="cart-product-name">
                      {item.product.name}
                    </div>

                    <div className="qty-controls">
                      <button
                        onClick={() => changeQty(item, -1)}
                        disabled={loadingId === item.id}
                      >
                        −
                      </button>

                      <span className="qty-value">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => changeQty(item, 1)}
                        disabled={loadingId === item.id}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Checkout Selected
            </button>
          )}
        </div>
      </>
    );
  }
