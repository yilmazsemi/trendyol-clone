import React, { useEffect, useState } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const updateCartItem = (id, change) => {
    const updated = [...cart];
    const index = updated.findIndex(item => item.id === id);

    if (index !== -1) {
      updated[index].quantity += change;
      if (updated[index].quantity <= 0) {
        updated.splice(index, 1);
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      setCart(updated);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  

  const getTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return <div className="cart-container"><h2>Sepetiniz boş</h2></div>;
  }

  return (
    <div className="cart-container">
      <h2>Sepetim</h2>
      {cart.map(item => (
        <div className="cart-item" key={item.id}>
          <img src={item.image} alt={item.title} className="cart-item-image" />
          <div className="cart-info">
            <h3>{item.title}</h3>
            <p>{item.price.toFixed(2)}₺ x {item.quantity}</p>

            <div className="cart-controls">
              <button onClick={() => updateCartItem(item.id, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateCartItem(item.id, 1)}>+</button>
            </div>
          </div>
        </div>
      ))}

      <h3 className="cart-total">Toplam: {getTotal().toFixed(2)}₺</h3>

      <button className="checkout-button" onClick={() => navigate('/checkout')}>
        Siparişi Tamamla
      </button>
    </div>
  );
};

export default Cart;
