import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { AuthContext } from './AuthContext';
import { IMaskInput } from 'react-imask';


Modal.setAppElement('#root'); // укажи корневой элемент твоего приложения

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [clientData, setClientData] = useState({ fio: '', phone: '' });
  const [userData, setUserData] = useState({ email: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get('https://localhost:44397/api/ClientProfile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientData(profileRes.data);

        const emailRes = await axios.get('https://localhost:44397/api/ClientProfile/email', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({ email: emailRes.data.email });
      } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://localhost:44397/api/ClientProfile', clientData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await axios.put('https://localhost:44397/api/ClientProfile/email', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditModalOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
  };

  return (
    <div className="container mt-5">
        <div className="profile-card">
        <h2>Профиль клиента</h2>

        <p><strong>ФИО:</strong> {clientData.fio}</p>
        <p><strong>Телефон:</strong> {clientData.phone}</p>
        <p><strong>Email:</strong> {userData.email}</p>

         <div className="button-center">
          <button className="btn" onClick={() => setEditModalOpen(true)}>
          Редактировать данные
          </button>
         </div>
    </div>

      <Modal
        className="custom-modal"
        isOpen={editModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        contentLabel="Редактирование профиля"
      >
        <h2>Редактирование профиля</h2>
        <form onSubmit={handleSave}>
          <label>
            <span className="label-text">ФИО:</span>
            <input
              type="text"
              value={clientData.fio}
              onChange={(e) => setClientData({ ...clientData, fio: e.target.value })}
              required
            />
          </label>

          <label>
  <span className="label-text">Телефон:</span>
  <IMaskInput
    mask="8(000)000-00-00"
    value={clientData.phone}
    onAccept={(value) => setClientData({ ...clientData, phone: value })}
    placeholder="8(___)___-__-__"
    type="tel"
    required
    className="your-input-class"
  />
</label>

          <label>
            <span className="label-text">Email:</span>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
            />
          </label>

          <div className="modal-buttons">
            <button className="btn" type="submit">Сохранить</button>
            <button className="btn" type="button" onClick={() => setEditModalOpen(false)}>Отмена</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
