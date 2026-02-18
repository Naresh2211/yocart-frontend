import { useEffect, useState } from "react";
import {
  getProducts,
  addToCart,
  updateProductStock,
} from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [stockInput, setStockInput] = useState({});
  const { role, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await getProducts();
    setProducts(res.data || []);
  };

  /* ================= COMMON LOGIN CHECK ================= */

  const requireLogin = () => {
    showToast("Please login to continue", "error");
    navigate("/login");
  };

  /* ================= USER LOGIC ================= */

  const inc = (id, stock) => {
    if (!token) return requireLogin();

    setQty((p) => ({
      ...p,
      [id]: Math.min((p[id] || 1) + 1, stock),
    }));
  };

  const dec = (id) => {
    if (!token) return requireLogin();

    setQty((p) => ({
      ...p,
      [id]: Math.max((p[id] || 1) - 1, 1),
    }));
  };

  const handleAdd = async (p) => {
    if (!token) return requireLogin();

    try {
      await addToCart(p.id, qty[p.id] || 1);
      showToast("Added to cart");
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  /* ================= ADMIN LOGIC ================= */

  const incStock = (id) => {
    setStockInput((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decStock = (id) => {
    setStockInput((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleUpdateStock = async (id) => {
    const value = stockInput[id] || 0;

    if (value === 0) {
      showToast("Stock value must be greater than 0", "warning");
      return;
    }

    try {
      await updateProductStock(id, value);
      showToast("Stock updated");
      loadProducts();
      setStockInput((prev) => ({ ...prev, [id]: 0 }));
    } catch {
      showToast("Failed to update stock", "error");
    }
  };

  return (
    <>
      <Navbar />

      {/* 🔥 IMPORTANT: ADMIN SCOPED WRAPPER */}
      <div className={`page ${isAdmin ? "admin-products-page" : ""}`}>
        <h2>Products</h2>

        {products.map((p) => {
          const q = qty[p.id] || 1;
          const adminStock = stockInput[p.id] ?? 0;

          return (
            <div
              key={p.id}
              className="product-card products-layout"
            >
              {/* ================= LEFT COLUMN ================= */}
              <div className="product-left">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="product-image"
                  />
                )}

                <p
                  className={`stock ${
                    p.stock > 0 ? "in-stock" : "out-stock"
                  }`}
                >
                  {p.stock > 0
                    ? `In stock : ${p.stock}`
                    : "Out of stock"}
                </p>

                {/* 👤 USER – Quantity */}
                {!isAdmin && (
                  <div className="user-qty">
                    <button onClick={() => dec(p.id)}>−</button>
                    <strong>{q}</strong>
                    <button onClick={() => inc(p.id, p.stock)}>
                      +
                    </button>
                  </div>
                )}

                {/* 🔑 ADMIN – Stock Control */}
                {isAdmin && (
                  <div className="admin-stock-row">
                    <strong>Add stock</strong>
                    <button onClick={() => decStock(p.id)}>
                      −
                    </button>
                    <span>{adminStock}</span>
                    <button onClick={() => incStock(p.id)}>
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* ================= RIGHT COLUMN ================= */}
              <div className="product-right">
                <div className="product-title">
                  {p.name}{" "}
                  <span className="product-color">
                    ({p.color})
                  </span>
                </div>

                <div className="product-specs">
                  <div>• RAM: {p.ram}</div>
                  <div>• Storage: {p.storage}</div>
                  <div>• Display: {p.display}</div>
                  <div>• Camera: {p.camera}</div>
                  <div>• Processor: {p.processor}</div>
                </div>

                <div className="product-price-lg">
                  ₹{p.price}
                </div>

                {/* 👤 USER – Add To Cart */}
                {!isAdmin && (
                  <button
                    className="add-cart-btn small"
                    disabled={p.stock === 0}
                    onClick={() => handleAdd(p)}
                  >
                    Add to Cart
                  </button>
                )}

                {/* 🔑 ADMIN – Update Stock */}
                {isAdmin && (
                  <button
                    className="add-cart-btn wide"
                    onClick={() =>
                      handleUpdateStock(p.id)
                    }
                  >
                    Update Stock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
