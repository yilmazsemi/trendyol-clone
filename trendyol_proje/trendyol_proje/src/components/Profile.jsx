import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';

const Profile = () => {
  const user = auth.currentUser;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setHasData(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        fullName,
        phone,
        address
      });
      setMessage('✔️ Bilgiler kaydedildi.');
      setIsEditing(false);
      setHasData(true);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('❌ Hata oluştu.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Profilim</h2>

      {!isEditing && hasData ? (
        <div className="profile-view">
          <p><strong>Ad Soyad:</strong> {fullName}</p>
          <p><strong>Telefon:</strong> {phone}</p>
          <p><strong>Adres:</strong> {address}</p>
          <button onClick={() => setIsEditing(true)}>Düzenle</button>
        </div>
      ) : (
        <form onSubmit={saveProfile} className="profile-form">
          <label>Ad Soyad</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <label>Telefon</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label>Adres</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>

          <div className="profile-buttons">
            <button type="submit">Kaydet</button>
            {hasData && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cancel-button"
              >
                Vazgeç
              </button>
            )}
          </div>

          <p className="profile-message">{message}</p>
        </form>
      )}
    </div>
  );
};

export default Profile;
