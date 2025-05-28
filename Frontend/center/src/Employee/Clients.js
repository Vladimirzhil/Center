import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { IMaskInput } from 'react-imask';

Modal.setAppElement('#root');

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisPhone, setAnalysisPhone] = useState('');
  const [clientAnalysis, setClientAnalysis] = useState([]);
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

  const fetchClientAnalysis = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`https://localhost:44397/api/Analysis/client?phone=${analysisPhone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientAnalysis(response.data);
    } catch (err) {
      console.error('Ошибка анализа клиента:', err);
      setClientAnalysis([]);
    }
  };

  return (
    <div className="applications-container">
      <h1>Управление клиентами</h1>

      {userRole === 'Admin' && (
        <>
          <button className="btns" onClick={() => openModal()}>Добавить клиента</button>
          <button className="btns" style={{ marginLeft: '10px' }} onClick={() => setAnalysisModalOpen(true)}>Анализ по телефону</button>
        </>
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
            <IMaskInput
              mask="8(000)000-00-00"
              value={formData.phone}
              onAccept={(value) => setFormData({ ...formData, phone: value })}
              placeholder="Телефон"
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
        onRequestClose={() => setAnalysisModalOpen(false)}
        className="custom-modal"
        contentLabel="Анализ заявок клиента"
        style={{
          content: {
            maxWidth: '1000px',
          }
        }}
      >
        <h2>Анализ заявок клиента</h2>
        <div>
          <label>Телефон клиента:</label>
          <IMaskInput
            mask="8(000)000-00-00"
            value={analysisPhone}
            onAccept={(value) => setAnalysisPhone(value)}
            placeholder="8(000)000-00-00"
          />
          <div className="modal-buttons">
          <button className="btns" onClick={fetchClientAnalysis}>Анализировать</button>
          </div>
        </div>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {clientAnalysis.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Объект</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Бригада</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата подачи</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Статус</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Начало обследования</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Окончание обследования</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата договора</th>
              </tr>
            </thead>
            <tbody>
              {clientAnalysis.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {item.cityname}, {item.streetname} {item.number}<br />
                    {item.organizationname} (ИНН: {item.inn})<br />
                    Площадь: {item.objectarea} м²
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.brigadename}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(item.incomingdate).toLocaleDateString('ru-RU')}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.status}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.startedate ? new Date(item.startedate).toLocaleDateString('ru-RU') : '—'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.enddate ? new Date(item.enddate).toLocaleDateString('ru-RU') : '—'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.createdate ? new Date(item.createdate).toLocaleDateString('ru-RU') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: '20px' }}>Нет заявок по указанному номеру телефона.</p>
        )}
        </div>
        <div className="modal-buttons">
          <button className="btns" onClick={() => {
            setAnalysisModalOpen(false);
            setAnalysisPhone('');
            setClientAnalysis([]);
          }}>Закрыть</button>
        </div>
      </Modal>
    </div>
  );
}
