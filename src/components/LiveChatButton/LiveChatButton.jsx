import { useState } from "react";
import styles from "./LiveChatButton.module.css";
import LiveChatWindow from "../LiveChatWindow/LiveChatWindow";

const LiveChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Clear unread count when opening chat (messages are now read)
      setUnreadCount(0);
      setShowNotification(false);
    }
  };

  const handleNewMessage = () => {
    // Increment unread count if chat is closed
    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);

      // Show notification toast
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Notification Toast */}
      {showNotification && (
        <div className={styles.notificationToast}>
          <span className={styles.notificationIcon}>📬</span>
          <span className={styles.notificationText}>New message received</span>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ position: "fixed", bottom: 0, right: 0, zIndex: 998 }}>
          <LiveChatWindow
            onClose={handleClose}
            onNewMessage={handleNewMessage}
          />
        </div>
      )}

      {/* Floating Chat Button */}
      <div className={styles.buttonWrapper}>
        <button
          onClick={handleToggle}
          className={`${styles.chatButton} ${isOpen ? styles.active : ""}`}
          aria-label={isOpen ? "Close live chat" : "Open live chat"}
        >
          <span className={styles.chatIcon}>{isOpen ? "✕" : "💬"}</span>

          {/* Unread Badge - Only shown when chat is closed AND there are unread messages */}
          {unreadCount > 0 && !isOpen && (
            <span className={styles.badge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {/* Active indicator */}
          {isOpen && <span className={styles.activeIndicator}></span>}
        </button>
      </div>
    </>
  );
};

export default LiveChatButton;
