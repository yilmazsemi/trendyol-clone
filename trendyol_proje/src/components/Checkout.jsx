import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import './Checkout.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  const handleCheckout = async () => {
    try {
      const updatedItems = [];

      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          updatedItems.push({
            productId: item.id,
            title: productData.title,
            price: productData.price,
            quantity: item.quantity,
            sellerId: productData.sellerId
          });
        }
      }

      await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        items: updatedItems,
        createdAt: Timestamp.now()
      });

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      setCartItems([]);
      setMessage('✔️ Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      setMessage('❌ Sipariş oluşturulamadı.');
    }
  };

  return (
    <div className="checkout-container">
      <h2>Siparişi Tamamla</h2>
      {cartItems.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <>
          <ul className="checkout-list">
            {cartItems.map(item => (
              <li key={item.id}>
                {item.title} - {item.quantity} adet - {(item.price * item.quantity).toFixed(2)}₺
              </li>
            ))}
          </ul>

          <button onClick={handleCheckout}>Siparişi Onayla</button>
        </>
      )}

      {message && <p className="checkout-message">{message}</p>}
    </div>
  );
};

export default Checkout;
