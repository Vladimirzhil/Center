// Компонент для управления выбранными услугами (SelectedServices)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function SelectedServices() {
  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [objects, setObjects] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    selectedServicesId: null,
    serviceId: '',
    applicationId: '',
    volume: ''
  });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    fetchAll(token);
  }, []);

  const fetchAll = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [servRes, appRes, cliRes, objRes, addrRes, selServRes] = await Promise.all([
        axios.get('https://localhost:44397/api/ServiceCatalog', config),
        axios.get('https://localhost:44397/api/Application', config),
        axios.get('https://localhost:44397/api/Client', config),
        axios.get('https://localhost:44397/api/ObjectSurvey', config),
        axios.get('https://localhost:44397/api/Address', config),
        axios.get('https://localhost:44397/api/SelectedServices', config)
      ]);

      setServices(servRes.data);
      setApplications(appRes.data);
      setClients(cliRes.data);
      setObjects(objRes.data);
      setAddresses(addrRes.data);
      setSelectedServices(selServRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const getServiceName = (id) => services.find(s => s.serviceId === id)?.serviceName || `Услуга #${id}`;

  const getApplicationInfo = (id) => {
    const app = applications.find(a => a.applicationId === id);
    if (!app) return `Заявка #${id}`;

    const client = clients.find(c => c.clientId === app.clientId);
    const object = objects.find(o => o.objectSurveyId === app.objectSurveyId);
    const address = object ? addresses.find(a => a.addressId === object.addressId) : null;

    const clientName = client?.fio || `Клиент #${app.clientId}`;
    const date = app.incomingDate?.split('T')[0];
    const addrStr = address ? `${address.cityName}, ${address.streetName} ${address.number}` : 'Адрес не найден';

    return `${clientName} — ${date} — ${addrStr}`;
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        selectedServicesId: item.selectedServicesId,
        serviceId: item.serviceId,
        applicationId: item.applicationId,
        volume: item.volume
      });
    } else {
      setFormData({ selectedServicesId: null, serviceId: '', applicationId: '', volume: '' });
    }
    setModalIsOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    const payload = {
      serviceId: Number(formData.serviceId),
      applicationId: Number(formData.applicationId),
      volume: Number(formData.volume),
      costServices: null
    };

    try {
      if (formData.selectedServicesId) {
        await axios.put(`https://localhost:44397/api/SelectedServices/${formData.selectedServicesId}`, payload, config);
      } else {
        await axios.post(`https://localhost:44397/api/SelectedServices`, payload, config);
      }
      setModalIsOpen(false);
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка сохранения услуги:', err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Удалить услугу?')) return;
    try {
      await axios.delete(`https://localhost:44397/api/SelectedServices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Выбранные услуги</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить услугу</button>
      )}

      <div className="table-responsive">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Заявка (Клиент — Дата — Адрес)</th>
              <th>Услуга</th>
              <th>Объем</th>
              <th>Стоимость</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {selectedServices.map(item => (
              <tr key={item.selectedServicesId}>
                <td>{item.selectedServicesId}</td>
                <td>{getApplicationInfo(item.applicationId)}</td>
                <td>{getServiceName(item.serviceId)}</td>
                <td>{item.volume}</td>
                <td>{item.costServices ?? '-'}</td>
                {userRole === 'Admin' && (
                  <td><button className="btns" onClick={() => openModal(item)}>Изменить</button></td>
                )}
                {userRole === 'Admin' && (
                  <td><button className="btns delete-btn" onClick={() => handleDelete(item.selectedServicesId)}>Удалить</button></td>
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
        <h2>{formData.selectedServicesId ? 'Редактировать услугу' : 'Добавить услугу'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Заявка:</label>
            <select value={formData.applicationId} onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })} required>
              <option value="">-- выберите --</option>
              {applications.map(app => (
                <option key={app.applicationId} value={app.applicationId}>{getApplicationInfo(app.applicationId)}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Услуга:</label>
            <select value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} required>
              <option value="">-- выберите --</option>
              {services.map(serv => (
                <option key={serv.serviceId} value={serv.serviceId}>{serv.serviceName}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Объем:</label>
            <input type="number" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} required />
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