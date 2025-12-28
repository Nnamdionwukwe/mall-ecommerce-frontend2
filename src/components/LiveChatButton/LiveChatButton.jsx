import { useState, useEffect } from "react";
import LiveChatWindow from "./LiveChatButton";
import styles from "./LiveChatButton.module.css";

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
        <LiveChatWindow onClose={handleClose} onNewMessage={handleNewMessage} />
      )}

      {/* Floating Chat Button */}
      <button
        onClick={handleToggle}
        className={styles.chatButton}
        aria-label="Open live chat"
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
