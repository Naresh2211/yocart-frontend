import { useState, useRef } from "react";
import { registerUser } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 refs for keyboard navigation
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const registerBtnRef = useRef(null);

  // ✅ GLOBAL TOAST
  const { showToast } = useToast();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showToast("All fields required", "warning");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name,
        email,
        password,
      });

      showToast("Registration successful. Please login");

      // ⏳ small delay so toast is visible
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="register-page">
    <div className="auth-wrapper">
  <div className="auth-brand">YO CART</div>

  <div className="register-card">
    <h2 className="register-title">Register</h2>

        {/* NAME */}
        <input
          className="register-input"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              emailRef.current?.focus();
            }
          }}
        />

        {/* EMAIL */}
        <input
          ref={emailRef}
          className="register-input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
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
          className="register-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              registerBtnRef.current?.click();
            }
          }}
        />

        {/* REGISTER BUTTON */}
        <button
          ref={registerBtnRef}
          className="register-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="register-footer">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>
      </div>
      </div>
    </div>
  );
}
