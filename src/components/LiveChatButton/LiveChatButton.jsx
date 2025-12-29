import { useState } from "react";
import styles from "./LiveChatButton.module.css";
import LiveChatWindow from "../LiveChatWindow/LiveChatWindow";

const LiveChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Clear unread count when opening chat
      setUnreadCount(0);
    }
  };

  const handleNewMessage = () => {
    // Increment unread count if chat is closed
    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
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
      <button
        onClick={handleToggle}
        className={styles.chatButton}
        aria-label={isOpen ? "Close live chat" : "Open live chat"}
      >
        <span className={styles.chatIcon}>{isOpen ? "✕" : "💬"}</span>
        {unreadCount > 0 && !isOpen && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
};

export default LiveChatButton;
