// Компонент для управления справочником услуг (ServiceCatalog)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function Services() {
  const [services, setServices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: null,
    serviceName: '',
    price: '',
    measurement: '',
    description: ''
  });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    fetchServices(token);
  }, []);

  const fetchServices = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get('https://localhost:44397/api/ServiceCatalog', config);
      setServices(res.data);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setFormData(service);
    } else {
      setFormData({ serviceId: null, serviceName: '', price: '', measurement: '', description: '' });
    }
    setModalIsOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    const payload = {
      serviceName: formData.serviceName,
      price: Number(formData.price),
      measurement: formData.measurement,
      description: formData.description
    };

    try {
      if (formData.serviceId) {
        await axios.put(`https://localhost:44397/api/ServiceCatalog/${formData.serviceId}`, payload, config);
      } else {
        await axios.post('https://localhost:44397/api/ServiceCatalog', payload, config);
      }
      setModalIsOpen(false);
      fetchServices(token);
    } catch (err) {
      console.error('Ошибка сохранения услуги:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить услугу?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44397/api/ServiceCatalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Справочник услуг</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить услугу</button>
      )}

      <div className="table-responsive">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Измерение</th>
              <th>Описание</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {services.map(serv => (
              <tr key={serv.serviceId}>
                <td>{serv.serviceId}</td>
                <td>{serv.serviceName}</td>
                <td>{serv.price}</td>
                <td>{serv.measurement}</td>
                <td>{serv.description}</td>
                {userRole === 'Admin' && (
                  <td><button className="btns" onClick={() => openModal(serv)}>Изменить</button></td>
                )}
                {userRole === 'Admin' && (
                  <td><button className="btns delete-btn" onClick={() => handleDelete(serv.serviceId)}>Удалить</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="custom-modal"
        contentLabel="Форма услуги"
      >
        <h2>{formData.serviceId ? 'Редактировать услугу' : 'Добавить услугу'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Название:</label>
            <input type="text" value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} required />
          </div>
          <div>
            <label>Цена:</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
          </div>
          <div>
            <label>Измерение:</label>
            <input type="text" value={formData.measurement} onChange={(e) => setFormData({ ...formData, measurement: e.target.value })} required />
          </div>
          <div>
            <label>Описание:</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
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