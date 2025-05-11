import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './Orders.css';

const Orders = () => {
  const user = auth.currentUser;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        console.log('User not logged in');
        return;
      }
  
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
  
        const snapshot = await getDocs(q);
        console.log('Fetched order count:', snapshot.size); // 🔍
  
        const orderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        console.log('Orders:', orderList); // 🔍
        setOrders(orderList);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };
  
    fetchOrders();
  }, [user]);
  

  if (!orders.length) {
    return <div className="orders-container"><h2>You have no orders yet.</h2></div>;
  }

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <p><strong>Order Date:</strong> {new Date(order.createdAt.toDate()).toLocaleString()}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.title} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)}₺</span>
              </div>
            ))}
          </div>
          <p className="order-total">Total: {order.total.toFixed(2)}₺</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
