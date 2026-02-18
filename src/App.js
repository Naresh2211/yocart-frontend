import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

import AdminOrders from "./admin/AdminOrders";
import AdminRefunds from "./admin/AdminRefunds";
import AdminReturns from "./admin/AdminReturns";

// 🔒 Private Route Component
const PrivateRoute = ({
  children,
  allowedRole,
  role,
  token,
}) => {
  const location = useLocation();

  // 🚫 Not logged in → send to login
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 🚫 Wrong role → send to products
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

function App() {
  const { token, role } = useAuth();

  return (
    <Routes>
      {/* 🌍 PUBLIC ROUTES */}
      <Route path="/" element={<Navigate to="/products" />} />
      <Route path="/products" element={<Products />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 👤 USER ROUTES */}
      <Route
        path="/cart"
        element={
          <PrivateRoute
            token={token}
            role={role}
            allowedRole="USER"
          >
            <Cart />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <PrivateRoute
            token={token}
            role={role}
            allowedRole="USER"
          >
            <Orders />
          </PrivateRoute>
        }
      />

      {/* 🔑 ADMIN ROUTES */}
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute
            token={token}
            role={role}
            allowedRole="ADMIN"
          >
            <AdminOrders />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/refunds"
        element={
          <PrivateRoute
            token={token}
            role={role}
            allowedRole="ADMIN"
          >
            <AdminRefunds />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/returns"
        element={
          <PrivateRoute
            token={token}
            role={role}
            allowedRole="ADMIN"
          >
            <AdminReturns />
          </PrivateRoute>
        }
      />

      {/* 🔄 FALLBACK */}
      <Route path="*" element={<Navigate to="/products" />} />
    </Routes>
  );
}

export default App;
