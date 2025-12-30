import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import Home from "./components/pages/Home/Home";
import ProductDetails from "./components/pages/ProductDetails/ProductDetails";
import CartPage from "./components/pages/Cart/CartPage";
import VendorDashboard from "./components/pages/VendorDashboard/VendorDashboard";
import Profile from "./components/pages/Profile/Profile";
import TrackOrder from "./components/pages/TrackOrder/TrackOrder";
import Orders from "./components/pages/Orders/Orders";
import Checkout from "./components/pages/Checkout/Checkout";
import OrderSuccess from "./components/pages/OrderSuccess/OrderSuccess";
import BottomNav from "./components/BottomNav/BottomNav";
import Support from "./components/pages/Support/Support";
import Homepage from "./components/pages/Homepage/Homepage";
import { CartProvider } from "./components/context/CartContext";
import { CurrencyProvider } from "./components/context/CurrencyContext";
import AdminOrders from "./components/admin/AdminOrders";
import AdminCartDashboard from "./components/admin/AdminCartDashboard";
import PrivacyPolicy from "./components/Policy/PrivacyPolicy";
import TermsOfService from "./components/Policy/TermsOfService";
import CookiesPolicy from "./components/Policy/CookiesPolicy";
import SupportTickets from "./components/SupportTickets/SupportTickets";
import MyTickets from "./components/MyTickets/MyTickets";
import AdminChatManagement from "./components/AdminChatManagement/AdminChatManagement";
import LiveChatButton from "./components/LiveChatButton/LiveChatButton";

// Component to conditionally show LiveChatButton
const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="appContainer">
        <Sidebar />
        <div className="appMain">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/shop" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/user-cart" element={<AdminCartDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/support-tickets" element={<SupportTickets />} />
            <Route path="/admin/chats" element={<AdminChatManagement />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies-policy" element={<CookiesPolicy />} />
          </Routes>
        </div>
      </div>

      <BottomNav />

      {/* Show LiveChatButton only for regular users (not admin/vendor) */}
      {user && user.role !== "admin" && user.role !== "vendor" && (
        <LiveChatButton />
      )}
    </>
  );
};

function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}

export default App;
