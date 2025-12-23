import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      console.log("🔍 Fetching user profile...");
      const response = await authAPI.getProfile();

      console.log("📦 Profile response:", response.data);

      // Fixed: Access user directly from response.data
      const userData = response.data.data || response.data.user;

      if (!userData) {
        console.error("❌ No user data in response");
        logout();
        return;
      }

      console.log("✅ User data set:", userData);
      setUser(userData);
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    console.log("🔐 Logging in user...");
    console.log("🔑 Token:", newToken);
    console.log("👤 User:", userData);

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    fetchUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
