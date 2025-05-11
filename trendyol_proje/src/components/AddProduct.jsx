import React, { useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !category || !image || !description) {
      setMessage('❌ Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        title,
        price: parseFloat(price),
        category,
        image,
        description,
        sellerId: auth.currentUser.uid,
        createdAt: Timestamp.now()
      });

      setMessage('✔️ Ürün başarıyla eklendi!');
      setTimeout(() => navigate('/seller/dashboard'), 1500);
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      setMessage('❌ Ürün eklenemedi.');
    }
  };

  return (
    <div className="add-product-container">
      <h2>Yeni Ürün Ekle</h2>
      <form onSubmit={handleSubmit} className="add-product-form">
        <label>Başlık</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Fiyat</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>Kategori</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />

        <label>Görsel URL</label>
        <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />

        <label>Açıklama</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit">Ürün Ekle</button>

        {message && <p className="add-message">{message}</p>}
      </form>
    </div>
  );
};

export default AddProduct;
