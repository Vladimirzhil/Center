import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
Modal.setAppElement('#root');

export default function Brigades() {
  const [brigades, setBrigades] = useState([]);
  const [filteredBrigades, setFilteredBrigades] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingBrigade, setEditingBrigade] = useState(null);
  const [brigadeName, setBrigadeName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });


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

  const handleBrigadeAnalysis = async () => {
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const params = {};
      if (dateRange.start) params.start = dateRange.start;
      if (dateRange.end) params.end = dateRange.end;

     const response = await axios.get('https://localhost:44397/api/Analysis/brigade', {
       headers: config.headers,
       params
      });

     setAnalysisData(response.data);
    } catch (err) {
      console.error('Ошибка при получении анализа бригады:', err);
    }
  };


  return (
    <div className="applications-container">
      <h1>Управление бригадами</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить бригаду</button>
      )}
        <button className="btns" onClick={() => setAnalysisModalOpen(true)}>Анализ по бригаде</button>
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
      <Modal
  isOpen={analysisModalOpen}
  onRequestClose={() => {
    setAnalysisModalOpen(false);
    setAnalysisData(null);
  }}
  className="custom-modal"
  contentLabel="Анализ по бригаде"
  style={{
          content: {
            maxWidth: '1000px',
          }
        }}
>
  <h2>Анализ по бригаде</h2>

  <div>
    <label>Дата начала:</label>
    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
  </div>
  <div>
    <label>Дата окончания:</label>
    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
  </div>
  <div className="modal-buttons">
  <button className="btns" onClick={handleBrigadeAnalysis}>Получить анализ</button>
  </div>
  {analysisData && (
    <div style={{ marginTop: '20px' }}>
      <h3>Результаты анализа:</h3>
      <div>
        <table className="applications-table">
          <thead>
            <tr>
              <th>Бригада</th>
              <th>Сумма заявок</th>
              <th>Кол-во заявок</th>
              <th>% заявок</th>
              <th>Кол-во договоров</th>
              <th>% договоров</th>
              <th>Первая заявка</th>
              <th>Последняя заявка</th>
            </tr>
          </thead>
          <tbody>
            {analysisData.map((row, index) => (
              <tr key={index}>
                <td>{row.brigadename}</td>
                <td>{row.sumprice.toLocaleString('ru-RU')} ₽</td>
                <td>{row.countapplication}</td>
                <td>{row.percentapplication}%</td>
                <td>{row.countagreement}</td>
                <td>{row.percentagreement}%</td>
                <td>{row.firstapplicationdate}</td>
                <td>{row.lastapplicationdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  <div className="modal-buttons">
    <button className="btns" onClick={() => setAnalysisModalOpen(false)}>Закрыть</button>
  </div>
</Modal>

    </div>
  );
}
