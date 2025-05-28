import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

Modal.setAppElement('#root');

export default function Brigades() {
  const [brigades, setBrigades] = useState([]);
  const [filteredBrigades, setFilteredBrigades] = useState([]);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingBrigade, setEditingBrigade] = useState(null);
  const [brigadeName, setBrigadeName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      fetchBrigades(token);
    }
  }, []);

  const fetchBrigades = async (token) => {
    try {
      const res = await axios.get('https://localhost:44397/api/Brigade', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBrigades(res.data);
    } catch (err) {
      console.error('Ошибка загрузки бригад:', err);
    }
  };

  useEffect(() => {
  const filtered = [...brigades]
    .filter(b => b.brigadeName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.brigadeId - b.brigadeId); // Сортировка по ID
  setFilteredBrigades(filtered);
  }, [brigades, search]);

  const openModal = (brigade = null) => {
    setEditingBrigade(brigade);
    setBrigadeName(brigade ? brigade.brigadeName : '');
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
      if (editingBrigade) {
        await axios.put(`https://localhost:44397/api/Brigade/${editingBrigade.brigadeId}`, {
          brigadeName
        }, config);
      } else {
        await axios.post('https://localhost:44397/api/Brigade', {
          brigadeName
        }, config);
      }
      setModalIsOpen(false);
      fetchBrigades(token);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить бригаду?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44397/api/Brigade/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      fetchBrigades(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Управление бригадами</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить бригаду</button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Фильтр по названию"
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
              <th>Название</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {filteredBrigades.length > 0 ? (
              filteredBrigades.map(b => (
                <tr key={b.brigadeId}>
                  <td>{b.brigadeId}</td>
                  <td>{b.brigadeName}</td>
                  {userRole === 'Admin' && (
                    <td>
                      <button className="btns edit-btn" onClick={() => openModal(b)}>Изменить</button>
                    </td>
                     )}
                    {userRole === 'Admin' && (
                    <td>
                      <button className="btns delete-btn" onClick={() => handleDelete(b.brigadeId)}>Удалить</button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={userRole === 'Admin' ? 3 : 2} className="no-data">
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
        contentLabel="Форма бригады"
      >
        <h2>{editingBrigade ? 'Редактировать бригаду' : 'Добавить бригаду'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Название:</label>
            <input
              type="text"
              value={brigadeName}
              onChange={(e) => setBrigadeName(e.target.value)}
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
