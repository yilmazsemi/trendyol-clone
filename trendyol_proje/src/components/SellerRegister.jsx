import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import {
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import './SellerRegister.css';

const SellerRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName || !email || !password || !phone || !description) {
      setMessage('❌ Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Save to seller_applications
      await addDoc(collection(db, 'seller_applications'), {
        companyName,
        email,
        phone,
        description,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      // 3. Set user role as 'seller'
      await setDoc(
        doc(db, 'users', uid),
        {
          email,
          role: 'seller'
        },
        { merge: true }
      );

      setMessage('✔️ Başvurunuz alındı ve hesabınız oluşturuldu!');
      setCompanyName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setDescription('');
    } catch (error) {
      console.error('Satıcı kayıt hatası:', error);
      setMessage('❌ Hesap oluşturulamadı: ' + error.message);
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

        <label>Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
