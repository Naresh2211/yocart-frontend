import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { role, token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isAdmin = role === "ADMIN";

  const requireLogin = () => {
    showToast("Please login to continue", "error");
    navigate("/login");
  };

  const handleCartClick = (e) => {
    if (!token) {
      e.preventDefault();
      requireLogin();
    }
  };

  const handleOrdersClick = (e) => {
    if (!token) {
      e.preventDefault();
      requireLogin();
    }
  };

  return (
    <nav className={`navbar ${isAdmin ? "admin-navbar" : "user-navbar"}`}>
      
      {/* LEFT SIDE LINKS */}
      <div className="navbar-links">
        <NavLink to="/products">Products</NavLink>

        {/* USER LINKS */}
        {!isAdmin && (
          <>
            <NavLink to="/cart" onClick={handleCartClick}>
              Cart
            </NavLink>

            <NavLink to="/orders" onClick={handleOrdersClick}>
              Orders
            </NavLink>
          </>
        )}

        {/* ADMIN LINKS */}
        {isAdmin && (
          <>
            <NavLink to="/admin/orders">
              Admin Orders
            </NavLink>

            <NavLink to="/admin/refunds">
              Refunds
            </NavLink>

            <NavLink to="/admin/returns">
              Returns
            </NavLink>
          </>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        <div className="brand-logo">YO CART</div>

        {token ? (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        ) : (
          <button
            className="logout-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
