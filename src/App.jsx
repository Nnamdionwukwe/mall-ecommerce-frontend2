import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import { AuthProvider } from "./components/context/AuthContext";
import Home from "./components/pages/Home/Home";
import ProductDetails from "./components/pages/ProductDetails/ProductDetails";
import CartPage from "./components/pages/Cart/CartPage";
import VendorDashboard from "./components/pages/VendorDashboard/VendorDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
