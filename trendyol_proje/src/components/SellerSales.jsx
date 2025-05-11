import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './SellerSales.css';

const SellerSales = () => {
  const [revenue, setRevenue] = useState(0);
  const [unitsSold, setUnitsSold] = useState(0);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'orders'));
        const sellerId = auth.currentUser?.uid;
        const productMap = {};
        let totalRevenue = 0;
        let totalUnits = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          const items = data.items || [];

          items.forEach(item => {
            if (item.sellerId === sellerId) {
              const productKey = item.productId;

              totalRevenue += item.price * item.quantity;
              totalUnits += item.quantity;

              if (!productMap[productKey]) {
                productMap[productKey] = {
                  title: item.title,
                  quantity: 0,
                  revenue: 0
                };
              }

              productMap[productKey].quantity += item.quantity;
              productMap[productKey].revenue += item.price * item.quantity;
            }
          });
        });

        const sortedProducts = Object.values(productMap).sort(
          (a, b) => b.quantity - a.quantity
        );

        setRevenue(totalRevenue);
        setUnitsSold(totalUnits);
        setTopProducts(sortedProducts);
      } catch (error) {
        console.error('Satış verileri alınamadı:', error);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="seller-sales-container">
      <h2>Satış Performansı</h2>

      <div className="sales-stats">
        <div className="stat-card">
          <h3>Toplam Gelir</h3>
          <p>{revenue.toFixed(2)}₺</p>
        </div>

        <div className="stat-card">
          <h3>Satılan Ürün Adedi</h3>
          <p>{unitsSold}</p>
        </div>
      </div>

      <div className="top-products">
        <h3>En Çok Satan Ürünler</h3>
        {topProducts.length === 0 ? (
          <p>Henüz satış yapılmadı.</p>
        ) : (
          <ul>
            {topProducts.map((product, index) => (
              <li key={index}>
                {product.title} — {product.quantity} adet — {product.revenue.toFixed(2)}₺
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SellerSales;
