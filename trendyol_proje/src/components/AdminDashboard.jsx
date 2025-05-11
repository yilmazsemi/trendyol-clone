import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'seller_applications'));
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(list);
      } catch (error) {
        console.error('Admin seller başvuruları çekilemedi:', error);
      }
    };

    fetchApplications();
  }, []);

  const approveSeller = async (id) => {
    try {
      const ref = doc(db, 'seller_applications', id);
      await updateDoc(ref, { status: 'approved' });
      const updated = applications.map(app =>
        app.id === id ? { ...app, status: 'approved' } : app
      );
      setApplications(updated);
    } catch (error) {
      console.error('Onay hatası:', error);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Satıcı Başvuruları</h2>
      {applications.length === 0 ? (
        <p>Henüz başvuru yok.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Şirket Adı</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Açıklama</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>{app.companyName}</td>
                <td>{app.email}</td>
                <td>{app.phone}</td>
                <td>{app.description}</td>
                <td>{app.status}</td>
                <td>
                  {app.status === 'pending' ? (
                    <button onClick={() => approveSeller(app.id)}>
                      Onayla
                    </button>
                  ) : (
                    <span style={{ color: 'green' }}>✔️</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
