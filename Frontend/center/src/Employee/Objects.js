// Компонент для управления объектами (ObjectSurvey) с возможностью добавления новых адресов, организаций и клиента
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function Objects() {
  const [objects, setObjects] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [clients, setClients] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [formData, setFormData] = useState({ clientId: '', organizationId: '', addressId: '', objectArea: '', newOrg: { name: '', inn: '' }, newAddr: { city: '', street: '', number: '' } });
  const [formError, setFormError] = useState('');

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
      const [objRes, addrRes, orgRes, clientRes] = await Promise.all([
        axios.get('https://localhost:44397/api/ObjectSurvey', config),
        axios.get('https://localhost:44397/api/Address', config),
        axios.get('https://localhost:44397/api/Organization', config),
        axios.get('https://localhost:44397/api/Client', config)
      ]);
      setObjects(objRes.data);
      setAddresses(addrRes.data);
      setOrganizations(orgRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  };

  const getAddress = (id) => {
    const addr = addresses.find(a => a.addressId === id);
    return addr ? `${addr.cityName}, ${addr.streetName} ${addr.number}` : 'Адрес не найден';
  };

  const getOrganization = (id) => {
    const org = organizations.find(o => o.organizationId === id);
    return org ? org.organizationName : 'Организация не найдена';
  };

  const openModal = (obj = null) => {
    setEditingObject(obj);
    setFormData(obj
      ? { clientId: obj.clientId, organizationId: obj.organizationId, addressId: obj.addressId, objectArea: obj.objectArea, newOrg: { name: '', inn: '' }, newAddr: { city: '', street: '', number: '' } }
      : { clientId: '', organizationId: '', addressId: '', objectArea: '', newOrg: { name: '', inn: '' }, newAddr: { city: '', street: '', number: '' } });
    setFormError('');
    setModalIsOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      // Проверка существования аналогичного адреса и организации
      if (!formData.addressId && (formData.newAddr.city && formData.newAddr.street && formData.newAddr.number)) {
        const existsAddress = addresses.find(a => a.cityName === formData.newAddr.city && a.streetName === formData.newAddr.street && a.number === formData.newAddr.number);
        if (existsAddress) {
          setFormError('Такой адрес уже существует. Выберите его из списка.');
          return;
        }
      }

      if (!formData.organizationId && formData.newOrg.name) {
        const existsOrg = organizations.find(o => o.organizationName === formData.newOrg.name);
        if (existsOrg) {
          setFormError('Такая организация уже существует. Выберите её из списка.');
          return;
        }
      }

      let addressId = formData.addressId;
      let organizationId = formData.organizationId;

      if (!addressId && (formData.newAddr.city || formData.newAddr.street || formData.newAddr.number)) {
        const addrRes = await axios.post('https://localhost:44397/api/Address', {
          cityName: formData.newAddr.city,
          streetName: formData.newAddr.street,
          number: formData.newAddr.number
        }, config);
        addressId = addrRes.data.addressId;
      }

      if (!organizationId && formData.newOrg.name) {
        const orgRes = await axios.post('https://localhost:44397/api/Organization', {
          organizationName: formData.newOrg.name,
          inn: formData.newOrg.inn || '00000000000'
        }, config);
        organizationId = orgRes.data.organizationId;
      }

      const payload = {
        organizationId: Number(organizationId),
        addressId: Number(addressId),
        clientId: Number(formData.clientId),
        objectArea: Number(formData.objectArea)
      };

      if (editingObject) {
        await axios.put(`https://localhost:44397/api/ObjectSurvey/${editingObject.objectSurveyId}`, payload, config);
      } else {
        await axios.post('https://localhost:44397/api/ObjectSurvey', payload, config);
      }
      setModalIsOpen(false);
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка сохранения объекта:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить объект?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44397/api/ObjectSurvey/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Управление объектами</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить объект</button>
      )}

      <div className="table-responsive">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Организация</th>
              <th>Адрес</th>
              <th>Площадь (м²)</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {[...objects].sort((a, b) => a.objectSurveyId - b.objectSurveyId).map(obj => (
              <tr key={obj.objectSurveyId}>
                <td>{obj.objectSurveyId}</td>
                <td>{clients.find(c => c.clientId === obj.clientId)?.fio || '-'}</td>
                <td>{getOrganization(obj.organizationId)}</td>
                <td>{getAddress(obj.addressId)}</td>
                <td>{obj.objectArea}</td>
                {userRole === 'Admin' && (
                  <td><button className="btns" onClick={() => openModal(obj)}>Изменить</button></td>
                )}
                {userRole === 'Admin' && (
                  <td><button className="btns delete-btn" onClick={() => handleDelete(obj.objectSurveyId)}>Удалить</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="object-modal"
        contentLabel="Форма объекта"
      >
        <h2>{editingObject ? 'Редактировать объект' : 'Добавить объект'}</h2>
        {formError && <div style={{ color: 'red', marginBottom: '10px' }}>{formError}</div>}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Клиент:</label>
            <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} required>
              <option value="">-- выберите клиента --</option>
              {clients.map(c => (
                <option key={c.clientId} value={c.clientId}>{c.fio}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Организация:</label>
            <select value={formData.organizationId} onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}>
              <option value="">-- новая организация --</option>
              {organizations.map(o => (
                <option key={o.organizationId} value={o.organizationId}>{o.organizationName}</option>
              ))}
            </select>
            {formData.organizationId === '' && (
              <>
                <input type="text" placeholder="Название новой организации" value={formData.newOrg.name} onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, name: e.target.value } })} required />
                <input type="text" placeholder="ИНН" value={formData.newOrg.inn} onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, inn: e.target.value } })} required />
              </>
            )}
          </div>
          <div>
            <label>Адрес:</label>
            <select value={formData.addressId} onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}>
              <option value="">-- новый адрес --</option>
              {addresses.map(a => (
                <option key={a.addressId} value={a.addressId}>{`${a.cityName}, ${a.streetName} ${a.number}`}</option>
              ))}
            </select>
            {formData.addressId === '' && (
              <div>
                <input type="text" placeholder="Город" value={formData.newAddr.city} onChange={(e) => setFormData({ ...formData, newAddr: { ...formData.newAddr, city: e.target.value } })} required />
                <input type="text" placeholder="Улица" value={formData.newAddr.street} onChange={(e) => setFormData({ ...formData, newAddr: { ...formData.newAddr, street: e.target.value } })} required />
                <input type="text" placeholder="Дом" value={formData.newAddr.number} onChange={(e) => setFormData({ ...formData, newAddr: { ...formData.newAddr, number: e.target.value } })} required />
              </div>
            )}
          </div>
          <div>
            <label>Площадь (м²):</label>
            <input type="number" value={formData.objectArea} onChange={(e) => setFormData({ ...formData, objectArea: e.target.value })} required />
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
