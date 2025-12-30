import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import styles from "./Sidebar.module.css";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "../LogoutModal/LogoutModal";

const logo = "/ochacho.PNG";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("authToken");
    setIsSidebarOpen(false);
    setLogoutOpen(false);
  };

  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={styles.hamburger}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className={`${styles.overlay} ${isSidebarOpen ? styles.show : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
      >
        {/* Close Button */}
        {/* <button
          className={styles.closeBtn}
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button> */}

        {/* Logo */}
        <Link to="/" className={styles.logoContainer} onClick={handleNavClick}>
          <img src={logo} alt="Mall Logo" className={styles.logoImage} />
        </Link>

        {/* Auth Buttons - Top Section */}
        <div className={styles.topAuthSection}>
          {user ? (
            <div className={styles.userInfoTop}>
              {/* <span className={styles.userNameTop}>👤 {user.name}</span> */}
              {/* <span className={styles.badgeTop}>{user.role}</span> */}
              <button
                onClick={handleLogoutClick}
                className={styles.logoutBtnTop}
              >
                🚪 Logout
              </button>
              <LogoutModal
                isOpen={logoutOpen}
                onCancel={() => setLogoutOpen(false)}
                logout={handleLogout}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAuth(true);
                setIsSidebarOpen(false);
              }}
              className={styles.loginBtnTop}
            >
              🔐 Login
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={styles.navLinks}>
          {user && (
            <>
              {(user.role === "vendor" || user.role === "admin") && (
                <Link
                  to="/vendor/dashboard"
                  className={styles.link}
                  onClick={handleNavClick}
                >
                  📊 Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className={styles.link}
                onClick={handleNavClick}
              >
                👤 Profile
              </Link>
              <Link
                to="/orders"
                className={styles.link}
                onClick={handleNavClick}
              >
                📦 My Orders
              </Link>
              <Link
                to="/support"
                className={styles.link}
                onClick={handleNavClick}
              >
                💬 Support
              </Link>
            </>
          )}
        </nav>

        {/* User Info / Auth Section */}
        <div className={styles.userSection}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userName}>👤 {user.name}</span>
                <span className={styles.badge}>{user.role}</span>
              </div>
              <button onClick={handleLogoutClick} className={styles.logoutBtn}>
                Logout
              </button>

              <LogoutModal
                isOpen={logoutOpen}
                onCancel={() => setLogoutOpen(false)}
                logout={handleLogout}
              />
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowAuth(true);
                  setIsSidebarOpen(false);
                }}
                className={styles.loginBtn}
              >
                Login / Register
              </button>
            </>
          )}
        </div>
      </aside>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Sidebar;
