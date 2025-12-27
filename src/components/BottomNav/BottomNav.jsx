import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import styles from "./BottomNav.module.css";
import LoginRequiredModal from "../LoginRequiredModal/LoginRequiredModal";
import AuthModal from "../AuthModal/AuthModal";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const { cart } = useCart();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    updateCartCount();
    // Listen for cart updates
    window.addEventListener("storage", updateCartCount);
    // Custom event for same-tab updates
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, [cart]);

  const updateCartCount = () => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const navItems = [
    {
      id: "home",
      icon: "🏠",
      label: "Home",
      path: "/",
      requiresAuth: false,
    },
    {
      id: "cart",
      icon: "🛒",
      label: "Cart",
      path: "/cart",
      requiresAuth: false,
      badge: cart.length,
    },
    {
      id: "orders",
      icon: "📦",
      label: "Orders",
      path: "/orders",
      requiresAuth: true,
    },
    {
      id: "support",
      icon: "💬",
      label: "Support",
      path: "/support",
      requiresAuth: false,
    },
    {
      id: "profile",
      icon: "👤",
      label: "Profile",
      path: "/profile",
      requiresAuth: true,
    },
  ];

  const handleNavClick = (item) => {
    if (item.requiresAuth && !user) {
      setSelectedFeature(item.label);
      setLoginModalOpen(true);
      return;
    }
    navigate(item.path);
  };

  const handleLoginRedirect = () => {
    setLoginModalOpen(false);
    setShowAuth(true);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={styles.bottomNav}>
        <div className={styles.navContainer}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`${styles.navItem} ${
                isActive(item.path) ? styles.active : ""
              }`}
              title={item.label}
            >
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{item.icon}</span>
                {item.badge > 0 && (
                  <span className={styles.badge}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <LoginRequiredModal
        isOpen={loginModalOpen}
        feature={selectedFeature}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLoginRedirect}
      />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default BottomNav;
