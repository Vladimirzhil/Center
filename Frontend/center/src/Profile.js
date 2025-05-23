import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [clientData, setClientData] = useState({ fio: '', phone: '' });
  const [userData, setUserData] = useState({ email: '', passwordHash: '' });
  const [editMode, setEditMode] = useState(false);
  const [editCreds, setEditCreds] = useState(false);

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
        setUserData(prev => ({ ...prev, email: emailRes.data.email }));
      } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleClientSave = async () => {
    try {
      await axios.put('https://localhost:44397/api/ClientProfile', clientData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
    } catch (error) {
      console.error('Ошибка при обновлении данных клиента:', error);
    }
  };

  const handleUserSave = async () => {
    try {
      await axios.put('https://localhost:44397/api/ClientProfile/email', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCreds(false);
    } catch (error) {
      console.error('Ошибка при обновлении email/пароля:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Профиль клиента</h2>

      <div className="mb-3">
        <label className="form-label">ФИО</label>
        <input
          type="text"
          className="form-control"
          value={clientData.fio}
          disabled={!editMode}
          onChange={(e) => setClientData({ ...clientData, fio: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Телефон</label>
        <input
          type="text"
          className="form-control"
          value={clientData.phone}
          disabled={!editMode}
          onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
        />
      </div>

      {!editMode ? (
        <button className="btn btn-primary me-2" onClick={() => setEditMode(true)}>Редактировать</button>
      ) : (
        <button className="btn btn-success me-2" onClick={handleClientSave}>Сохранить</button>
      )}

      <hr />

      <h4>Данные входа</h4>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={userData.email}
          disabled={!editCreds}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Новый пароль</label>
        <input
          type="password"
          className="form-control"
          value={userData.passwordHash}
          disabled={!editCreds}
          onChange={(e) => setUserData({ ...userData, passwordHash: e.target.value })}
        />
      </div>

      {!editCreds ? (
        <button className="btn btn-secondary" onClick={() => setEditCreds(true)}>Изменить email/пароль</button>
      ) : (
        <button className="btn btn-success" onClick={handleUserSave}>Сохранить вход</button>
      )}
    </div>
  );
}
