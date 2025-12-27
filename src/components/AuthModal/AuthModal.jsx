import { useState } from "react";
import styles from "./AuthModal.module.css";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const AuthModal = ({ onClose }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login({
            email: formData.email,
            password: formData.password,
          })
        : await authAPI.register(formData);

      console.log("✅ Auth response:", response.data);

      // Fixed: Access token and user directly from response.data
      const { token, user } = response.data;

      if (!token) {
        setError("No token received from server");
        return;
      }

      console.log("🔑 Token received:", token);
      console.log("👤 User received:", user);

      // Store token and user
      login(token, user);
      onClose();
    } catch (err) {
      console.error("❌ Auth error:", err);

      let errorMsg = "Authentication failed";

      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.msg) {
        errorMsg = err.response.data.errors[0].msg;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isLogin ? "👋 Welcome Back" : "🎉 Join Us"}
          </h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Admin Token</label>
              <input
                type="password"
                required
                minLength={6}
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Account Type</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">Customer</option>
                {adminToken === "123456" && (
                  <option value="vendor">Vendor/Store Owner</option>
                )}
              </select>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className={styles.switchBtn}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
