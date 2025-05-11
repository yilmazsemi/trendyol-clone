import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'products'),
          where('sellerId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(list);
      } catch (error) {
        console.error('Satıcı ürünleri alınamadı:', error);
      }
    };

    fetchProducts();
  }, [user]);

  return (
    <div className="seller-dashboard-container">
      <div className="dashboard-header">
        <h2>Ürünlerim</h2>
        <button onClick={() => navigate('/seller/add-product')}>
          + Ürün Ekle
        </button>
      </div>

      {products.length === 0 ? (
        <p>Henüz eklenmiş bir ürün yok.</p>
      ) : (
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.title} />
              <div>
                <h3>{product.title}</h3>
                <p>{product.price.toFixed(2)}₺</p>
                <p>{product.category}</p>
                {/* Edit/Delete buttons to be added in next step */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
