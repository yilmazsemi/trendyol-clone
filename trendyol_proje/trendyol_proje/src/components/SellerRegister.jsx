import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './SellerRegister.css';

const SellerRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName || !email || !phone || !description) {
      setMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await addDoc(collection(db, 'seller_applications'), {
        companyName,
        email,
        phone,
        description,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      setMessage('✔️ Başvurunuz alındı. Yönetici onayı bekleniyor.');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setDescription('');
    } catch (error) {
      console.error('Başvuru hatası:', error);
      setMessage('❌ Başvuru gönderilirken bir hata oluştu.');
    }
  };

  return (
    <div className="seller-register-container">
      <h2>Satıcı Başvurusu</h2>
      <form onSubmit={handleSubmit} className="seller-form">
        <label>Şirket Adı</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Telefon</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Şirket Açıklaması</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <button type="submit">Başvur</button>

        {message && <p className="seller-message">{message}</p>}
      </form>
    </div>
  );
};

export default SellerRegister;
