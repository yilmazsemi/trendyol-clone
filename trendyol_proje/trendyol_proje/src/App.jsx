import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // ⬅️ Add this
import SignUp from './components/SignUp';
import Login from './components/Login';
import Profile from './components/Profile';
import Category from './components/Category';
import Search from './components/Search';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import SellerRegister from './components/SellerRegister';
import SellerLogin from './components/SellerLogin';
import SellerDashboard from './components/SellerDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Products from './components/Products'; 
import Orders from './components/Orders'; 

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/products" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/categories/:id" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </>
  );
}

export default App;
