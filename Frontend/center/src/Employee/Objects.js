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
  const [analysisModalIsOpen, setAnalysisModalIsOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [editingObject, setEditingObject] = useState(null);
  const [formData, setFormData] = useState({ clientId: '', organizationId: '', addressId: '', objectArea: '', newOrg: { name: '', inn: '' }, newAddr: { city: '', street: '', number: '' } });
  const [formError, setFormError] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterAddr, setFilterAddr] = useState('');

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

  const handleOrgAnalysis = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const response = await axios.get('https://localhost:44397/api/Analysis/organization', {
        ...config,
        params: dateRange
      });
      setAnalysisData(response.data);
      setAnalysisModalIsOpen(true);
    } catch (err) {
      console.error('Ошибка анализа организаций:', err);
    }
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

  const filteredObjects = objects.filter(obj => {
    const orgName = getOrganization(obj.organizationId).toLowerCase();
    const addrStr = getAddress(obj.addressId).toLowerCase();
    return orgName.includes(filterOrg.toLowerCase()) && addrStr.includes(filterAddr.toLowerCase());
  });

  return (
    <div className="applications-container">
      <h1>Управление объектами</h1>

      {userRole === 'Admin' && (
        <>
          <button className="btns" onClick={() => openModal()}>Добавить объект</button>
          <button className="btns" onClick={handleOrgAnalysis} style={{ marginLeft: '10px' }}>Анализ организаций</button>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Фильтр по организации" value={filterOrg} onChange={e => setFilterOrg(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '10px', border: '1.5px solid #303030' }}/>
        <input type="text" placeholder="Фильтр по адресу" value={filterAddr} onChange={e => setFilterAddr(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '10px', border: '1.5px solid #303030' }}/>
      </div>

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
            {filteredObjects.sort((a, b) => a.objectSurveyId - b.objectSurveyId).map(obj => (
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
        {/* существующая форма объекта */}
      </Modal>

      <Modal
        isOpen={analysisModalIsOpen}
        onRequestClose={() => setAnalysisModalIsOpen(false)}
        className="custom-modal"
        contentLabel="Анализ организаций"
        style={{
          content: {
            maxWidth: '1100px',
          }
        }}
      >
        <h2>Анализ организаций</h2>
        <div>
          <label>Дата начала:</label>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
        </div>
        <div>
          <label>Дата окончания:</label>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
        </div>
        {analysisData.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div>
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Организация</th>
                    <th>ИНН</th>
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
                      <td>{row.organizationname}</td>
                      <td>{row.inn}</td>
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
          <button className="btns" onClick={() => setAnalysisModalIsOpen(false)}>Закрыть</button>
        </div>
      </Modal>
    </div>
  );
}
