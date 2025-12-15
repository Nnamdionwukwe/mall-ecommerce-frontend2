import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";

const logo = "/ochacho.PNG";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="Mall Logo" className={styles.logoImage} />
          </Link>

          <div className={styles.navLinks}>
            {/* <Link to="/" className={styles.link}>
              Home
            </Link> */}
            {user && (
              <>
                {/* <Link to="/cart" className={styles.link}>
                  <div className={styles.cartTextDiv}>
                    <div className={styles.cartTextEmoji}>🛒</div>
                    <div className={styles.cartText}>Cart</div>
                  </div>
                </Link> */}
                {(user.role === "vendor" || user.role === "admin") && (
                  <Link to="/vendor/dashboard" className={styles.link}>
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          <div className={styles.navActions}>
            {user ? (
              <>
                <span className={styles.userName}>
                  {user && (
                    <Link to="/profile" className={styles.link}>
                      👤
                    </Link>
                  )}

                  <span className={styles.badge}>{user.role}</span>
                </span>
                <button onClick={logout} className={styles.logoutBtn}>
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className={styles.loginBtn}
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;
