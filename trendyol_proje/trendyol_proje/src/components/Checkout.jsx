import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));

    const fetchAddress = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAddress(data.address || '');
        }
      }
    };

    fetchAddress();
  }, [user]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (!address.trim()) {
      setMessage('⚠️ Lütfen bir adres girin.');
      return;
    }

    try {
      const orderRef = doc(collection(db, 'orders'));
      await setDoc(orderRef, {
        userId: user.uid,
        items: cart,
        total,
        address,
        createdAt: new Date()
      });

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      setMessage('✅ Siparişiniz alındı!');
      setTimeout(() => {
        navigate('/products');
      }, 2500);
    } catch (error) {
      console.error('Order error:', error);
      setMessage('❌ Sipariş oluşturulurken hata oluştu.');
    }
  };

  if (!cart.length) {
    return <div className="checkout-container"><h2>Sepetiniz boş.</h2></div>;
  }

  return (
    <div className="checkout-container">
      <h2>Siparişi Tamamla</h2>
      <div className="checkout-items">
        {cart.map(item => (
          <div key={item.id} className="checkout-item">
            <span>{item.title} x {item.quantity}</span>
            <span>{(item.price * item.quantity).toFixed(2)}₺</span>
          </div>
        ))}
      </div>

      <div className="checkout-summary">
        <label>Teslimat Adresi</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adres giriniz"
        ></textarea>

        <p className="checkout-total">Toplam: {total.toFixed(2)}₺</p>
        <button onClick={handleOrder}>Siparişi Onayla</button>
        {message && <p className="checkout-message">{message}</p>}
      </div>
    </div>
  );
};

export default Checkout;
