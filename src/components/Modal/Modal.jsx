import { useEffect } from "react";

// Modal.module.css styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "slideUp 0.3s ease-out",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  icon: {
    fontSize: "32px",
    lineHeight: 1,
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
    color: "#1a1a1a",
  },
  message: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#4a4a4a",
    marginBottom: "24px",
    whiteSpace: "pre-wrap",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  button: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "80px",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
  },
  primaryButtonHover: {
    backgroundColor: "#0056b3",
  },
  dangerButton: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  dangerButtonHover: {
    backgroundColor: "#c82333",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    color: "white",
  },
  secondaryButtonHover: {
    backgroundColor: "#545b62",
  },
};

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info", // 'info', 'success', 'warning', 'error', 'confirm'
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "confirm":
        return "❓";
      default:
        return "ℹ️";
    }
  };

  const getButtonStyle = () => {
    if (type === "error" || type === "confirm") {
      return { ...styles.button, ...styles.dangerButton };
    }
    return { ...styles.button, ...styles.primaryButton };
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.icon}>{getIcon()}</span>
          <h2 style={styles.title}>{title}</h2>
        </div>

        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          {showCancel && (
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  styles.secondaryButtonHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  styles.secondaryButton.backgroundColor;
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            style={getButtonStyle()}
            onClick={handleConfirm}
            onMouseEnter={(e) => {
              if (type === "error" || type === "confirm") {
                e.target.style.backgroundColor =
                  styles.dangerButtonHover.backgroundColor;
              } else {
                e.target.style.backgroundColor =
                  styles.primaryButtonHover.backgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              if (type === "error" || type === "confirm") {
                e.target.style.backgroundColor =
                  styles.dangerButton.backgroundColor;
              } else {
                e.target.style.backgroundColor =
                  styles.primaryButton.backgroundColor;
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
