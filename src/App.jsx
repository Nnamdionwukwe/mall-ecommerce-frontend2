import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import { AuthProvider } from "./components/context/AuthContext";
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
import MyTickets from "./components/pages/MyTickets/MyTickets";
import Homepage from "./components/pages/Homepage/Homepage";
import { useState } from "react";

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // Store in localStorage
    localStorage.setItem(
      "cart",
      JSON.stringify([...cart, { ...product, quantity: 1 }])
    );
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage addToCart={addToCart} />} />
            <Route path="/shop" element={<Home addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/support" element={<Support />} />
            <Route path="/my-tickets" element={<MyTickets />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
