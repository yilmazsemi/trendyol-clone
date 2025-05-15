import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from 'firebase/firestore';
import './AdminSellers.css';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);

  const fetchSellers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'seller'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSellers(list);
    } catch (error) {
      console.error('Satıcılar alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const toggleSellerStatus = async (sellerId, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const ref = doc(db, 'users', sellerId);
      await updateDoc(ref, { status: newStatus });
      fetchSellers(); // Refresh the list
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  return (
    <div className="admin-sellers-container">
      <h2>Satıcı Yönetimi</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map(seller => (
            <tr key={seller.id}>
              <td>{seller.email}</td>
              <td>{seller.status || 'active'}</td>
              <td>
                <button
                  className={seller.status === 'suspended' ? 'activate' : 'suspend'}
                  onClick={() => toggleSellerStatus(seller.id, seller.status || 'active')}
                >
                  {seller.status === 'suspended' ? 'Aktif Et' : 'Askıya Al'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSellers;
