import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <h3 className={styles.brandName}>
              🛍️ Ochacho Pharmacy & Supermarket
            </h3>
            <p className={styles.brandDescription}>
              Your one-stop shop for quality products from trusted vendors. Shop
              with confidence and enjoy fast, secure delivery.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                📘
              </a>
              <a href="#" className={styles.socialLink}>
                📷
              </a>
              <a href="#" className={styles.socialLink}>
                🐦
              </a>
              <a href="#" className={styles.socialLink}>
                ▶️
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li>
                <button onClick={() => navigate("/")}>Home</button>
              </li>
              <li>
                <button onClick={() => navigate("/shop")}>Shop</button>
              </li>
              <li>
                <button onClick={() => navigate("/orders")}>Orders</button>
              </li>
              <li>
                <button onClick={() => navigate("/profile")}>Profile</button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>Customer Service</h4>
            <ul className={styles.linkList}>
              <li>
                <button onClick={() => navigate("/support")}>Support</button>
              </li>
              <li>
                <button onClick={() => navigate("/track-order")}>
                  Track Order
                </button>
              </li>
              <li>
                <a href="#">Returns</a>
              </li>
              <li>
                <a href="#">Shipping Info</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>Contact Us</h4>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.contactIcon}>📧</span>
                <a href="mailto:support@mallstore.com">support@mallstore.com</a>
              </li>
              <li>
                <span className={styles.contactIcon}>📱</span>
                <a href="tel:+2348000000000">+234 800 000 0000</a>
              </li>
              <li>
                <span className={styles.contactIcon}>📍</span>
                <span>Lagos, Nigeria</span>
              </li>
              <li>
                <span className={styles.contactIcon}>🕐</span>
                <span>Mon-Fri: 9AM - 5PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>© {currentYear} Mall Store. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
