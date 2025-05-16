import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate, Navigate } from "react-router-dom";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "products"),
        where("sellerId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    } catch (error) {
      console.error("Satıcı ürünleri alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bu ürünü silmek istediğinize emin misiniz?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const checkStatusAndFetch = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        if (data?.status === "suspended" || data?.status === "pending") {
          setBlocked(true);
          window.alert(
            data.status === "suspended"
              ? "Hesabınız askıya alınmıştır"
              : "Hesabınız henüz onaylanmamıştır"
          );
        } else {
          fetchProducts();
        }
      } catch (error) {
        console.error("Kullanıcı durumu alınamadı:", error);
      }
    };

    checkStatusAndFetch();
  }, [user]);

  if (blocked) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="seller-dashboard-container">
      <div className="seller-dashboard-header">
        <h2>Ürünlerim</h2>
        <div className="seller-buttons">
          <button onClick={() => navigate("/seller/add-product")}>
            + Ürün Ekle
          </button>
          <button onClick={() => navigate("/seller/sales")}>
            Satış Performansı
          </button>
          <button onClick={() => navigate("/seller/questions")}>
            Müşteri Soruları
          </button>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="seller-product-card">
            <div className="image-container">
              <img src={product.image} alt={product.title} />
            </div>

            <h3>{product.title}</h3>
            <p className="price">{product.price.toFixed(2)}₺</p>
            <p className="category">{product.category}</p>
            <p className="date">
              {product.createdAt?.toDate().toLocaleDateString() || "Tarih yok"}
            </p>
            <span className="badge">Aktif Ürün</span>

            <div className="card-actions">
              <button
                onClick={() => navigate(`/seller/edit-product/${product.id}`)}
              >
                Düzenle
              </button>
              <button onClick={() => handleDelete(product.id)}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;
