import React from "react";
import styles from "./LoginRequiredModal.module.css";
import { X, Lock } from "lucide-react";

const LoginRequiredModal = ({ isOpen, feature, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginModal}>
        <div className={styles.loginHeader}>
          <div className={styles.loginIconBox}>
            <Lock className={styles.loginIcon} size={24} />
          </div>
          <div className={styles.loginTitleSection}>
            <h2 className={styles.loginTitle}>Login Required</h2>
            <p className={styles.loginSubtitle}>
              Please login to access this feature
            </p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <p className={styles.loginDescription}>
          {feature || "This feature"} is only available to registered users.
          Please login or create an account to continue.
        </p>

        <div className={styles.loginButtonGroup}>
          <button onClick={onClose} className={styles.loginCancelBtn}>
            Cancel
          </button>
          <button onClick={onLogin} className={styles.loginConfirmBtn}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
