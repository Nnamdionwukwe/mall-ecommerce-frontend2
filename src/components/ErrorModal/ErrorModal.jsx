import { useState } from "react";
import styles from "./ErrorModal.module.css";

const ErrorModal = ({ isOpen, title, message, reference, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReference = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>

          {reference && (
            <div className={styles.referenceBox}>
              <label className={styles.referenceLabel}>Reference Number</label>
              <div className={styles.referenceContent}>
                <code className={styles.referenceText}>{reference}</code>
                <button
                  className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                  onClick={handleCopyReference}
                  title="Copy reference"
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.actionBtn} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
