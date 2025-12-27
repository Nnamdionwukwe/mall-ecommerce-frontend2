import styles from "./ClearCartModal.module.css";
import { AlertCircle, Trash2, X } from "lucide-react";

const ClearCartModal = ({ isOpen, onConfirm, onCancel, itemCount }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onCancel} />

      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* Close Button */}
          <button className={styles.closeBtn} onClick={onCancel}>
            <X size={24} />
          </button>

          {/* Icon */}
          <div className={styles.iconContainer}>
            <AlertCircle size={48} />
          </div>

          {/* Content */}
          <h2 className={styles.title}>Clear Your Cart?</h2>

          <p className={styles.message}>
            Are you sure you want to remove all {itemCount} item
            {itemCount !== 1 ? "s" : ""} from your cart? This action cannot be
            undone.
          </p>

          {/* Summary */}
          <div className={styles.cartSummary}>
            <div className={styles.summaryItem}>
              <Trash2 size={20} />
              <span>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className={styles.warning}>
            <span className={styles.warningIcon}>⚠️</span>
            <p>You'll need to add items to your cart again to proceed.</p>
          </div>

          {/* Buttons */}
          <div className={styles.buttonContainer}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button className={styles.confirmBtn} onClick={onConfirm}>
              <Trash2 size={18} />
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClearCartModal;
