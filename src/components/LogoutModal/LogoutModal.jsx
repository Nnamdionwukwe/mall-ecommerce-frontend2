import React from "react";
import styles from "./LogoutModal.module.css";
import { X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LogoutModal = ({ isOpen, onCancel, logout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    try {
      logout();
      onCancel(); // Close modal
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={styles.logoutOverlay}>
      <div className={styles.logoutModal}>
        <div className={styles.logoutHeader}>
          <div className={styles.iconBox}>
            <LogOut className={styles.logoutIcon} size={24} />
          </div>
          <div className={styles.logoutTitleSection}>
            <h2 className={styles.logoutTitle}>Logout?</h2>
            <p className={styles.logoutSubtitle}>
              Are you sure you want to logout?
            </p>
          </div>
          <button onClick={onCancel} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <p className={styles.logoutDescription}>
          You'll need to login again to access your account and saved
          preferences.
        </p>

        <div className={styles.logoutButtonGroup}>
          <button onClick={onCancel} className={styles.logoutCancelBtn}>
            Cancel
          </button>
          <button onClick={handleLogout} className={styles.logoutConfirmBtn}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
