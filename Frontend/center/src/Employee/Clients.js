import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

Modal.setAppElement('#root');

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ fio: '', phone: '' });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      fetchClients(token);
    }
  }, []);

  const fetchClients = async (token) => {
    try {
      const res = await axios.get('https://localhost:44397/api/Client', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(res.data);
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err);
    }
  };

  useEffect(() => {
    const filtered = [...clients]
      .filter(c => c.fio.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.clientId - b.clientId);
    setFilteredClients(filtered);
  }, [clients, search]);

  const openModal = (client = null) => {
    setEditingClient(client);
    setFormData(client ? { fio: client.fio, phone: client.phone } : { fio: '', phone: '' });
    setModalIsOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    try {
      if (editingClient) {
        await axios.put(`https://localhost:44397/api/Client/${editingClient.clientId}`, formData, config);
      } else {
        await axios.post('https://localhost:44397/api/Client', formData, config);
      }
      setModalIsOpen(false);
      fetchClients(token);
    } catch (err) {
      console.error('Ошибка сохранения клиента:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить клиента?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44397/api/Client/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClients(token);
    } catch (err) {
      console.error('Ошибка удаления клиента:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Управление клиентами</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить клиента</button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Фильтр по ФИО клиента"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', width: '100%', borderRadius: '10px', border: '1.5px solid #303030' }}
        />
      </div>

      <div className="table-responsive">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Телефон</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map(c => (
                <tr key={c.clientId}>
                  <td>{c.clientId}</td>
                  <td>{c.fio}</td>
                  <td>{c.phone}</td>
                  {userRole === 'Admin' && (
                    <td>
                      <button className="btns edit-btn" onClick={() => openModal(c)}>Изменить</button>
                    </td>
                  )}
                  {userRole === 'Admin' && (
                    <td>
                      <button className="btns delete-btn" onClick={() => handleDelete(c.clientId)}>Удалить</button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={userRole === 'Admin' ? 4 : 3} className="no-data">
                  Нет данных для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="custom-modal"
        contentLabel="Форма клиента"
      >
        <h2>{editingClient ? 'Редактировать клиента' : 'Добавить клиента'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>ФИО:</label>
            <input
              type="text"
              name="fio"
              value={formData.fio}
              onChange={(e) => setFormData({ ...formData, fio: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Телефон:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btns">Сохранить</button>
            <button type="button" className="btns" onClick={() => setModalIsOpen(false)}>Отмена</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}