import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import styles from "./LiveChatWindow.module.css";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api";

const LiveChatWindow = ({ onClose, onNewMessage }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const autoRefreshRef = useRef(null);

  const AUTO_REFRESH_INTERVAL = 4000; // 4 seconds

  // Get base URL without /api
  const getSocketURL = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    // Remove /api from the end if it exists
    return apiUrl.replace(/\/api$/, "");
  };

  useEffect(() => {
    if (!user || !token) {
      console.log("❌ No user or token");
      setStatus("error");
      return;
    }

    console.log("🔌 Initializing chat...");
    initializeChat();

    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket");
        socketRef.current.disconnect();
      }
      clearTimeout(typingTimeoutRef.current);
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [user, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh messages
  useEffect(() => {
    if (!chatId || status !== "active") return;

    const refreshMessages = async () => {
      try {
        const response = await chatAPI.getMyChat();
        if (response.data.success) {
          const fetchedMessages = response.data.data.messages || [];
          setMessages((prevMessages) => {
            // Only update if messages have changed
            if (
              JSON.stringify(prevMessages) !== JSON.stringify(fetchedMessages)
            ) {
              // Check if there are new messages from others
              if (fetchedMessages.length > prevMessages.length) {
                const newMsgs = fetchedMessages.slice(prevMessages.length);
                const hasNewFromOther = newMsgs.some(
                  (m) => m.senderId !== user.id
                );
                if (hasNewFromOther) {
                  onNewMessage?.();
                }
              }
              return fetchedMessages;
            }
            return prevMessages;
          });
        }
      } catch (error) {
        console.error("❌ Failed to refresh messages:", error);
      }
    };

    // Initial refresh
    refreshMessages();

    // Set up auto-refresh interval
    autoRefreshRef.current = setInterval(
      refreshMessages,
      AUTO_REFRESH_INTERVAL
    );

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [chatId, status, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      console.log("📱 Fetching chat...");
      setStatus("connecting");

      const response = await chatAPI.getMyChat();
      console.log("✅ Chat fetched:", response.data);

      if (response.data.success) {
        const chat = response.data.data;
        setChatId(chat._id);
        setMessages(chat.messages || []);
        setStatus("active");

        // Initialize Socket.IO after getting chat
        initializeSocket(chat._id);
      }
    } catch (error) {
      console.error("❌ Failed to initialize chat:", error);
      setStatus("error");
    }
  };

  const initializeSocket = (chatId) => {
    try {
      const socketURL = getSocketURL();
      console.log("🔌 Connecting to Socket.IO:", socketURL);
      console.log("   Chat ID:", chatId);
      console.log("   Has token:", !!token);

      socketRef.current = io(socketURL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current.id);
        setStatus("active");
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setStatus("disconnected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setStatus("error");
      });

      socketRef.current.on("connected", (data) => {
        console.log("✅ Server confirmed connection:", data);
      });

      socketRef.current.on("new-message", (data) => {
        console.log("📨 New message received:", data);
        if (data.chatId === chatId) {
          setMessages((prev) => {
            // Avoid duplicates
            const exists = prev.some(
              (m) =>
                m.timestamp === data.message.timestamp &&
                m.senderId === data.message.senderId &&
                m.message === data.message.message
            );
            if (exists) return prev;
            return [...prev, data.message];
          });
          if (data.message.senderId !== user.id) {
            onNewMessage?.();
          }
          scrollToBottom();
        }
      });

      socketRef.current.on("typing", (data) => {
        if (data.chatId === chatId && data.userId !== user.id) {
          setIsTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      });

      socketRef.current.on("stop-typing", (data) => {
        if (data.chatId === chatId) {
          setIsTyping(false);
        }
      });

      socketRef.current.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });
    } catch (error) {
      console.error("❌ Socket initialization error:", error);
      setStatus("error");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || status !== "active") return;

    const messageText = newMessage.trim();

    try {
      console.log("📤 Sending message...");

      const response = await chatAPI.sendMessage({
        chatId,
        message: messageText,
      });

      if (response.data.success) {
        console.log("✅ Message sent via API");

        // Emit to socket for real-time broadcast
        if (socketRef.current?.connected) {
          socketRef.current.emit("send-message", {
            chatId,
            message: messageText,
          });
          console.log("✅ Message emitted via socket");
        }

        setNewMessage("");
        socketRef.current?.emit("stop-typing", { chatId });
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleTyping = () => {
    if (chatId && socketRef.current?.connected) {
      socketRef.current.emit("typing", { chatId, userId: user.id });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCloseChat = async () => {
    if (chatId) {
      try {
        await chatAPI.closeChat(chatId);
      } catch (error) {
        console.error("Failed to close chat:", error);
      }
    }
    onClose();
  };

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatarGroup}>
            <span className={styles.avatar}>👨‍💼</span>
            {status === "active" && <span className={styles.statusDot}></span>}
          </div>
          <div>
            <h3 className={styles.title}>Live Support</h3>
            <p className={styles.subtitle}>
              {status === "active"
                ? "We're here to help!"
                : status === "connecting"
                ? "Connecting..."
                : status === "error"
                ? "Connection error"
                : "Disconnected"}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleCloseChat}
            className={styles.closeBtn}
            aria-label="Close chat"
          >
            🔚
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {status === "error" ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚠️</span>
            <p>Connection error</p>
            <p className={styles.emptySubtext}>
              Please try refreshing the page
            </p>
            <button
              onClick={initializeChat}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Retry Connection
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💬</span>
            <p>Start a conversation with our support team!</p>
            <p className={styles.emptySubtext}>
              We typically reply within a few minutes
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  msg.senderId === user?.id
                    ? styles.messageSent
                    : styles.messageReceived
                }`}
              >
                <div className={styles.messageContent}>
                  {msg.senderId !== user?.id && (
                    <div className={styles.senderName}>
                      {msg.senderName}
                      <span className={styles.senderRole}>
                        {msg.senderRole === "admin" ? "Admin" : "Support"}
                      </span>
                    </div>
                  )}
                  <div className={styles.messageText}>{msg.message}</div>
                  <div className={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.messageReceived}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingBubble}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className={styles.inputArea}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder={
            status === "active"
              ? "Type your message..."
              : status === "connecting"
              ? "Connecting..."
              : "Reconnecting..."
          }
          className={styles.input}
          disabled={status !== "active"}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!newMessage.trim() || status !== "active"}
        >
          <span>➤</span>
        </button>
      </form>

      {/* Footer */}
      <div className={styles.footer}>
        <span>🔒 Secure conversation</span>
      </div>
    </div>
  );
};

export default LiveChatWindow;
