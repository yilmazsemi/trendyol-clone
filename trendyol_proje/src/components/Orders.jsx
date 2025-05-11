import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(list);
      } catch (error) {
        console.error('Siparişler alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h2>Siparişlerim</h2>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <p>Hiç siparişiniz bulunmuyor.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <p className="order-date">
              {order.createdAt?.toDate().toLocaleString() || 'Tarih yok'}
            </p>
            <ul className="order-items">
              {order.items?.map((item, index) => (
                <li key={index}>
                  <strong>{item.title}</strong> — {item.quantity} adet —
                  {' '}
                  {item.price && item.quantity
                    ? (item.price * item.quantity).toFixed(2) + '₺'
                    : 'Fiyat yok'}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
