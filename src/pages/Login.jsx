import { useState, useRef } from "react";
import { loginUser } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);
  const loginBtnRef = useRef(null);

  // ✅ GLOBAL TOAST
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!identifier || !password) {
      showToast(
        "Email/Username and password are required",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser({
        email: identifier, // email OR username
        password,
      });

      login(res.data.token, res.data.role);

      showToast("Login successful");

      // ⏳ allow toast to be visible before redirect
      setTimeout(() => {
        window.location.href = "/products";
      }, 1000);
    } catch {
      showToast("Invalid email/username or password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="login-page">
    <div className="auth-wrapper">
  <div className="auth-brand">YO CART</div>

  <div className="login-card">
    <h2 className="login-title">Login</h2>

        {/* EMAIL OR USERNAME */}
        <input
          type="text"
          className="login-input"
          placeholder="Email or Username"
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              passwordRef.current?.focus();
            }
          }}
        />

        {/* PASSWORD */}
        <input
          ref={passwordRef}
          type="password"
          className="login-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              loginBtnRef.current?.click();
            }
          }}
        />

        {/* LOGIN BUTTON */}
        <button
          ref={loginBtnRef}
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="login-footer">
          Don’t have an account?{" "}
          <a href="/register">Register</a>
        </p>
      </div>
    </div>
    </div>
  );
}
