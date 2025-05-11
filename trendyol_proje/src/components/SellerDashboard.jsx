import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

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

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bu ürünü silmek istediğinize emin misiniz?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  return (
    <div className="seller-dashboard-container">
      <div className="seller-dashboard-header">
        <h2>Ürünlerim</h2>
        <button onClick={() => navigate('/seller/add-product')}>
          + Ürün Ekle
        </button>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="seller-product-card">
            <div className="image-container">
              <img src={product.image} alt={product.title} />
            </div>

            <h3>{product.title}</h3>
            <p className="price">{product.price.toFixed(2)}₺</p>
            <p className="category">{product.category}</p>
            <p className="date">
              {product.createdAt?.toDate().toLocaleDateString() || 'Tarih yok'}
            </p>
            <span className="badge">Aktif Ürün</span>

            <div className="card-actions">
              <button onClick={() => navigate(`/seller/edit-product/${product.id}`)}>
                Düzenle
              </button>
              <button onClick={() => handleDelete(product.id)}>
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;
