import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import './AdminReports.css';

const AdminReports = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'product_reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(list);
    } catch (error) {
      console.error('Şikayetler alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId) => {
    try {
      const ref = doc(db, 'product_reports', reportId);
      await updateDoc(ref, { status: 'resolved' });
      fetchReports();
    } catch (error) {
      console.error('Şikayet çözümlenemedi:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirm = window.confirm('Bu ürünü silmek istediğinize emin misiniz?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      alert('Ürün silindi.');
    } catch (error) {
      console.error('Ürün silinemedi:', error);
    }
  };

  return (
    <div className="admin-reports-container">
      <h2>Ürün Şikayetleri</h2>

      {reports.length === 0 ? (
        <p>Hiç şikayet bulunamadı.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ürün ID</th>
              <th>Kullanıcı ID</th>
              <th>Sebep</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.productId}</td>
                <td>{report.userId}</td>
                <td>{report.reason}</td>
                <td>{report.status}</td>
                <td>{report.createdAt?.toDate().toLocaleString()}</td>
                <td>
                  {report.status !== 'resolved' && (
                    <button onClick={() => handleResolve(report.id)}>
                      Çözüldü
                    </button>
                  )}
                  <button onClick={() => handleDeleteProduct(report.productId)}>
                    Ürünü Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReports;
