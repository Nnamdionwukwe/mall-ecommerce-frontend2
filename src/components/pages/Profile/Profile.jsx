import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import styles from "./Profile.module.css";
import LogoutModal from "../../LogoutModal/LogoutModal";
// import LogoutModal from "../../LogoutModal/LogoutModal";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  // Your logout function from context or auth hook
  const logout1 = () => {
    // Clear auth tokens, user data, etc.
    logout();
    localStorage.removeItem("authToken");
    // or your auth service logout method
  };

  useEffect(() => {
    if (!user) {
      navigate("/profile");
      return;
    }
    setFormData({
      name: user.name,
      email: user.email,
    });
    getUserLocation();
  }, [user, navigate]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding using OpenStreetMap Nominatim API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            setLocation({
              latitude,
              longitude,
              city:
                data.address.city || data.address.town || data.address.village,
              state: data.address.state,
              country: data.address.country,
              displayName: data.display_name,
            });
          } catch (error) {
            console.error("Error getting location details:", error);
            setLocation({
              latitude,
              longitude,
              city: "Unknown",
              state: "Unknown",
              country: "Unknown",
              displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            });
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation(null);
          setLocationLoading(false);
        }
      );
    } else {
      setLocation(null);
      setLocationLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await authAPI.updateProfile(formData);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setIsEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Failed to update profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ text: "Password changed successfully!", type: "success" });
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Failed to change password",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  if (!user) {
    return null;
  }

  const getRoleIcon = (role) => {
    const icons = {
      user: "👤",
      vendor: "🏪",
      admin: "👑",
    };
    return icons[role] || "👤";
  };

  const getRoleColor = (role) => {
    const colors = {
      user: "#3b82f6",
      vendor: "#10b981",
      admin: "#f59e0b",
    };
    return colors[role] || "#6b7280";
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>My Profile</h1>
          <button onClick={handleLogoutClick} className={styles.logoutBtn}>
            🚪 Logout
          </button>

          <LogoutModal
            isOpen={logoutOpen}
            onCancel={() => setLogoutOpen(false)}
            logout={logout1}
          />
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.grid}>
          {/* Profile Card */}
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <h2>{user.name}</h2>
                <p className={styles.email}>{user.email}</p>
                <span
                  className={styles.roleBadge}
                  style={{ background: getRoleColor(user.role) }}
                >
                  {getRoleIcon(user.role)} {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className={styles.divider}></div>

            {!isEditing ? (
              <div className={styles.detailsSection}>
                <h3>Account Details</h3>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Name:</span>
                  <span className={styles.value}>{user.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{user.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Role:</span>
                  <span className={styles.value}>{user.role}</span>
                </div>
                {user.vendorId && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Vendor ID:</span>
                    <span className={styles.value}>{user.vendorId}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.label}>Member Since:</span>
                  <span className={styles.value}>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editBtn}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className={styles.passwordBtn}
                  >
                    🔒 Change Password
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className={styles.form}>
                <h3>Edit Profile</h3>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.saveBtn}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className={styles.form}>
                <h3>Change Password</h3>
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.saveBtn}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Location Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>📍 Current Location</h3>

            {locationLoading ? (
              <div className={styles.locationLoading}>
                <div className={styles.spinner}></div>
                <p>Getting your location...</p>
              </div>
            ) : location ? (
              <div className={styles.locationInfo}>
                <div className={styles.mapPlaceholder}>
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      location.longitude - 0.01
                    },${location.latitude - 0.01},${
                      location.longitude + 0.01
                    },${location.latitude + 0.01}&layer=mapnik&marker=${
                      location.latitude
                    },${location.longitude}`}
                    style={{ border: 0, borderRadius: "0.5rem" }}
                  ></iframe>
                </div>

                <div className={styles.locationDetails}>
                  <div className={styles.locationItem}>
                    <span className={styles.locationIcon}>🌆</span>
                    <div>
                      <p className={styles.locationLabel}>City</p>
                      <p className={styles.locationValue}>{location.city}</p>
                    </div>
                  </div>
                  <div className={styles.locationItem}>
                    <span className={styles.locationIcon}>🗺️</span>
                    <div>
                      <p className={styles.locationLabel}>State</p>
                      <p className={styles.locationValue}>{location.state}</p>
                    </div>
                  </div>
                  <div className={styles.locationItem}>
                    <span className={styles.locationIcon}>🌍</span>
                    <div>
                      <p className={styles.locationLabel}>Country</p>
                      <p className={styles.locationValue}>{location.country}</p>
                    </div>
                  </div>
                  <div className={styles.locationItem}>
                    <span className={styles.locationIcon}>📌</span>
                    <div>
                      <p className={styles.locationLabel}>Coordinates</p>
                      <p className={styles.locationValue}>
                        {location.latitude.toFixed(4)},{" "}
                        {location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={getUserLocation}
                  className={styles.refreshLocationBtn}
                >
                  🔄 Refresh Location
                </button>
              </div>
            ) : (
              <div className={styles.locationError}>
                <p>📍 Location access denied or unavailable</p>
                <p className={styles.locationErrorHint}>
                  Please enable location access in your browser settings
                </p>
                <button
                  onClick={getUserLocation}
                  className={styles.retryLocationBtn}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <div className={styles.actionButtons}>
            <button onClick={() => navigate("/")} className={styles.actionBtn}>
              🏠 Home
            </button>
            <button
              onClick={() => navigate("/cart")}
              className={styles.actionBtn}
            >
              🛒 Cart
            </button>
            {(user.role === "vendor" || user.role === "admin") && (
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className={styles.actionBtn}
              >
                📊 Dashboard
              </button>
            )}
            <button onClick={handleLogout} className={styles.actionBtnDanger}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
