import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import styles from "./AdminChatManagement.module.css";
import { useAuth } from "../context/AuthContext";

const AdminChatManagement = () => {
  const { user, token } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!user || !token) return;

    fetchChats();

    // Connect to Socket.IO
    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Admin socket connected");
    });

    socketRef.current.on("new-message", (data) => {
      console.log("📨 New message in admin:", data);

      // Update chat list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === data.chatId
            ? {
                ...chat,
                messages: [...chat.messages, data.message],
                lastMessageAt: new Date(),
              }
            : chat
        )
      );

      // Update selected chat
      if (selectedChat && selectedChat._id === data.chatId) {
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
      }
    });

    socketRef.current.on("new-chat", (data) => {
      console.log("🆕 New chat created:", data);
      fetchChats();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const statusQuery = filter !== "all" ? `?status=${filter}` : "";
      const response = await fetch(
        `${API_URL}/api/chat/admin/all${statusQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    // Mark as read
    try {
      await fetch(`${API_URL}/api/chat/${chat._id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }

    // Assign to self if not assigned
    if (!chat.assignedTo && chat.status === "waiting") {
      handleAssignChat(chat._id);
    }
  };

  const handleAssignChat = async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/${chatId}/assign`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        fetchChats();
        if (selectedChat?._id === chatId) {
          setSelectedChat(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to assign chat:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch(`${API_URL}/api/chat/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        socketRef.current?.emit("send-message", {
          chatId: selectedChat._id,
          message: newMessage.trim(),
        });

        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      await fetch(`${API_URL}/api/chat/${chatId}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchChats();
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Failed to close chat:", error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getFilteredChats = () => {
    if (filter === "all") return chats;
    return chats.filter((chat) => chat.status === filter);
  };

  const waitingCount = chats.filter((c) => c.status === "waiting").length;
  const activeCount = chats.filter((c) => c.status === "active").length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>💬 Live Chat Management</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.statLabel}>Waiting:</span>
            <span className={styles.statValue}>{waitingCount}</span>
          </span>
          <span className={styles.stat}>
            <span className={styles.statLabel}>Active:</span>
            <span className={styles.statValue}>{activeCount}</span>
          </span>
        </div>
      </div>

      <div className={styles.chatContainer}>
        {/* Chat List Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${
                filter === "all" ? styles.active : ""
              }`}
              onClick={() => {
                setFilter("all");
                fetchChats();
              }}
            >
              All
            </button>
            <button
              className={`${styles.filterBtn} ${
                filter === "waiting" ? styles.active : ""
              }`}
              onClick={() => {
                setFilter("waiting");
                fetchChats();
              }}
            >
              Waiting ({waitingCount})
            </button>
            <button
              className={`${styles.filterBtn} ${
                filter === "active" ? styles.active : ""
              }`}
              onClick={() => {
                setFilter("active");
                fetchChats();
              }}
            >
              Active ({activeCount})
            </button>
          </div>

          <div className={styles.chatList}>
            {loading ? (
              <div className={styles.loading}>Loading chats...</div>
            ) : getFilteredChats().length === 0 ? (
              <div className={styles.empty}>No chats found</div>
            ) : (
              getFilteredChats().map((chat) => (
                <div
                  key={chat._id}
                  className={`${styles.chatItem} ${
                    selectedChat?._id === chat._id ? styles.selected : ""
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className={styles.chatAvatar}>
                    <span>👤</span>
                    {chat.status === "waiting" && (
                      <span className={styles.waitingBadge}></span>
                    )}
                  </div>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatTop}>
                      <span className={styles.chatName}>{chat.userName}</span>
                      <span className={styles.chatTime}>
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    <div className={styles.chatBottom}>
                      <span className={styles.chatPreview}>
                        {chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1].message
                          : "No messages yet"}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className={styles.chatStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[chat.status]
                        }`}
                      >
                        {chat.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                  <h3>{selectedChat.userName}</h3>
                  <p>{selectedChat.userEmail}</p>
                </div>
                <div className={styles.chatHeaderActions}>
                  {selectedChat.status !== "closed" && (
                    <button
                      onClick={() => handleCloseChat(selectedChat._id)}
                      className={styles.closeChat}
                    >
                      Close Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className={styles.messages}>
                {selectedChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${
                      msg.senderRole === "admin" || msg.senderRole === "vendor"
                        ? styles.messageSent
                        : styles.messageReceived
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.messageSender}>
                        {msg.senderName}
                        <span className={styles.messageRole}>
                          {msg.senderRole}
                        </span>
                      </div>
                      <div className={styles.messageText}>{msg.message}</div>
                      <div className={styles.messageTime}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedChat.status !== "closed" && (
                <form onSubmit={handleSendMessage} className={styles.inputArea}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className={styles.input}
                  />
                  <button
                    type="submit"
                    className={styles.sendBtn}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className={styles.noChat}>
              <span className={styles.noChatIcon}>💬</span>
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatManagement;
