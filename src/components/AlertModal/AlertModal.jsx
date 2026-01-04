// import styles from "./AlertModal.module.css";
// import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

// const AlertModal = ({
//   isOpen,
//   onClose,
//   title,
//   message,
//   type = "info", // "success", "error", "warning", "info"
//   primaryBtnText = "OK",
//   secondaryBtnText = null,
//   onPrimaryClick,
//   onSecondaryClick,
// }) => {
//   if (!isOpen) return null;

//   const getIcon = () => {
//     switch (type) {
//       case "success":
//         return <CheckCircle className={styles.icon} />;
//       case "error":
//         return <XCircle className={styles.icon} />;
//       case "warning":
//         return <AlertCircle className={styles.icon} />;
//       case "info":
//       default:
//         return <Info className={styles.icon} />;
//     }
//   };

//   const getTypeColor = () => {
//     switch (type) {
//       case "success":
//         return "success";
//       case "error":
//         return "error";
//       case "warning":
//         return "warning";
//       case "info":
//       default:
//         return "info";
//     }
//   };

//   return (
//     <>
//       {/* Overlay */}
//       <div className={styles.overlay} onClick={onClose} />

//       {/* Modal */}
//       <div className={styles.modal}>
//         <div className={`${styles.modalContent} ${styles[getTypeColor()]}`}>
//           {/* Icon Container */}
//           <div className={`${styles.iconContainer} ${styles[getTypeColor()]}`}>
//             {getIcon()}
//           </div>

//           {/* Content */}
//           <h2 className={styles.title}>{title}</h2>
//           <p className={styles.message}>{message}</p>

//           {/* Buttons */}
//           <div className={styles.buttonContainer}>
//             {secondaryBtnText && (
//               <button
//                 className={styles.secondaryBtn}
//                 onClick={onSecondaryClick || onClose}
//               >
//                 {secondaryBtnText}
//               </button>
//             )}
//             <button
//               className={`${styles.primaryBtn} ${styles[getTypeColor()]}`}
//               onClick={onPrimaryClick || onClose}
//             >
//               {primaryBtnText}
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AlertModal;

import styles from "./AlertModal.module.css";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info", // "success", "error", "warning", "info"
  primaryBtnText = "OK",
  secondaryBtnText = null,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className={styles.icon} />;
      case "error":
        return <XCircle className={styles.icon} />;
      case "warning":
        return <AlertCircle className={styles.icon} />;
      case "info":
      default:
        return <Info className={styles.icon} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
      default:
        return "info";
    }
  };

  const typeColor = getTypeColor();

  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        <div className={`${styles.modalContent} ${styles[typeColor]}`}>
          {/* Icon Container */}
          <div className={`${styles.iconContainer} ${styles[typeColor]}`}>
            {getIcon()}
          </div>

          {/* Content */}
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>

          {/* Buttons */}
          <div className={styles.buttonContainer}>
            {secondaryBtnText && (
              <button
                className={styles.secondaryBtn}
                onClick={handleSecondaryClick}
              >
                {secondaryBtnText}
              </button>
            )}
            <button
              className={`${styles.primaryBtn} ${styles[typeColor]}`}
              onClick={handlePrimaryClick}
            >
              {primaryBtnText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertModal;
