import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setPrice(data.price || '');
          setDiscountPercentage(data.discountPercentage || '');
          setCategory(data.category || '');
          setImage(data.image || '');
          setDescription(data.description || '');
        } else {
          setMessage('❌ Ürün bulunamadı.');
        }
      } catch (error) {
        console.error('Ürün getirme hatası:', error);
        setMessage('❌ Ürün yüklenirken bir hata oluştu.');
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const ref = doc(db, 'products', id);
      await updateDoc(ref, {
        title,
        price: parseFloat(price),
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
        category,
        image,
        description
      });

      setMessage('✔️ Ürün başarıyla güncellendi!');
      setTimeout(() => navigate('/seller/dashboard'), 1500);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setMessage('❌ Güncelleme başarısız.');
    }
  };

  return (
    <div className="edit-product-container">
      <h2>Ürün Güncelle</h2>
      <form onSubmit={handleUpdate} className="edit-product-form">
        <label>Başlık</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Fiyat</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>İndirim (%)</label>
        <input
          type="number"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
          placeholder="Varsa, örn: 15"
        />

        <label>Kategori</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />

        <label>Görsel URL</label>
        <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />

        <label>Açıklama</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit">Güncelle</button>

        {message && <p className="edit-message">{message}</p>}
      </form>
    </div>
  );
};

export default EditProduct;
