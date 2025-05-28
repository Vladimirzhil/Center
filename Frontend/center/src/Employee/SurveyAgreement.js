import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function Agreements() {
  const [agreements, setAgreements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [objects, setObjects] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    agreementId: null,
    applicationId: '',
    reportId: '',
    employeeId: '',
    createDate: new Date().toISOString().split('T')[0],
    confirmation: false,
    priceForOrder: 0
  });
  const [userRole, setUserRole] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchAppId, setSearchAppId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      setEmployeeId(decoded["EmployeeId"] ? parseInt(decoded["EmployeeId"]) : null);
      fetchAll(token);
    }
  }, []);

  const fetchAll = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [agreementsRes, reportsRes, empRes, appsRes, clientsRes, objectsRes, addressesRes] = await Promise.all([
        axios.get('https://localhost:44397/api/SurveyAgreement', config),
        axios.get('https://localhost:44397/api/SurveyReport', config),
        axios.get('https://localhost:44397/api/Employee', config),
        axios.get('https://localhost:44397/api/Application', config),
        axios.get('https://localhost:44397/api/Client', config),
        axios.get('https://localhost:44397/api/ObjectSurvey', config),
        axios.get('https://localhost:44397/api/Address', config),
      ]);
      setApplications(appsRes.data);
      setClients(clientsRes.data);
      setObjects(objectsRes.data);
      setAddresses(addressesRes.data);
      setAgreements(agreementsRes.data);
      setReports(reportsRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  };

  const getApplicationInfo = (id) => {
    const app = applications.find(a => a.applicationId === id);
    if (!app) return '—';
    const client = clients.find(c => c.clientId === app.clientId);
    const object = objects.find(o => o.objectSurveyId === app.objectSurveyId);
    const address = addresses.find(a => a.addressId === object?.addressId);
    const addressStr = address ? `${address.cityName}, ${address.streetName} ${address.number}` : 'Адрес не найден';
    const clientName = client?.fio || 'Клиент';
    const dateStr = app.createdate ? new Date(app.createdate).toLocaleDateString('ru-RU') : '—';
    return `${clientName} | ${addressStr} | ${dateStr}`;
  };

  const getReportName = id => `Отчёт #${id}`;
  const getEmployeeName = id => employees.find(e => e.employeeid === id)?.fio || `Сотрудник #${id}`;

  const openModal = (agreement = null) => {
    if (agreement) {
      setFormData({
        agreementId: agreement.surveyAgreementId,
        applicationId: agreement.applicationId,
        reportId: agreement.reportId,
        employeeId: agreement.employeeId,
        createDate: agreement.createDate.split('T')[0],
        confirmation: agreement.confirmation,
        priceForOrder: agreement.priceForOrder
      });
    } else {
      setFormData({
        agreementId: null,
        applicationId: '',
        reportId: '',
        employeeId: '',
        createDate: new Date().toISOString().split('T')[0],
        confirmation: false,
        priceForOrder: 0
      });
    }
    setErrorMessage('');
    setModalOpen(true);
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
      const payload = {
        applicationId: Number(formData.applicationId),
        reportId: Number(formData.reportId),
        employeeId: userRole === 'Admin' ? Number(formData.employeeId) : employeeId,
        createDate: formData.createDate,
        confirmation: false
      };

      if (formData.agreementId) {
        await axios.put(`https://localhost:44397/api/SurveyAgreement/${formData.agreementId}`, payload, config);
      } else {
        await axios.post(`https://localhost:44397/api/SurveyAgreement`, payload, config);
      }
      setModalOpen(false);
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setErrorMessage('Ошибка сохранения. Проверьте данные.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить договор?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44397/api/SurveyAgreement/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка удаления договора:', err);
    }
  };

  const filteredAgreements = agreements.filter(agr =>
    searchAppId === '' || agr.applicationId?.toString().includes(searchAppId)
  );

  return (
    <div className="applications-container">
      <h1>Договора обследования</h1>
      <button className="btns" onClick={() => openModal()}>Добавить договор</button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Поиск по ID заявки"
        value={searchAppId}
        onChange={(e) => setSearchAppId(e.target.value)}
        style={{ padding: '8px', width: '100%', borderRadius: '10px', border: '1.5px solid #303030' }}
      />
      </div>
      <div className="table-responsive">
      <table className="applications-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Заявка</th>
            <th>Отчёт</th>
            <th>Сотрудник</th>
            <th>Дата</th>
            <th>Подтверждён</th>
            <th>Стоимость</th>
            <th>Изменить</th>
            {userRole === 'Admin' &&<th>Удалить</th>}
          </tr>
        </thead>
        <tbody>
          {filteredAgreements.map(agr => (
            <tr key={agr.surveyAgreementId}>
              <td>{agr.surveyAgreementId}</td>
              <td>{agr.applicationId} — {getApplicationInfo(agr.applicationId)}</td>
              <td>{getReportName(agr.reportId)}</td>
              <td>{getEmployeeName(agr.employeeId)}</td>
              <td>{new Date(agr.createDate).toLocaleDateString('ru-RU')}</td>
              <td>{agr.confirmation ? 'Да' : 'Нет'}</td>
              <td>{agr.priceForOrder} ₽</td>
              <td>
                <button className="btns" onClick={() => openModal(agr)}>Изменить</button>
                </td>
                <td>
                {userRole === 'Admin' && <button className="btns delete-btn" onClick={() => handleDelete(agr.surveyAgreementId)}>Удалить</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="custom-modal"
        contentLabel="Форма договора"
      >
        <h2>{formData.agreementId ? 'Редактировать договор' : 'Новый договор'}</h2>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Заявка:</label>
            <select value={formData.applicationId} onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })} required>
              <option value="">-- выберите --</option>
              {applications.map(app => (
                <option key={app.applicationId} value={app.applicationId}>
                  {app.applicationId} — {getApplicationInfo(app.applicationId)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Отчёт:</label>
            <select value={formData.reportId} onChange={(e) => setFormData({ ...formData, reportId: e.target.value })} required>
              <option value="">-- выберите --</option>
              {reports.map(r => (
                <option key={r.reportId} value={r.reportId}>Отчёт #{r.reportId}</option>
              ))}
            </select>
          </div>
          {userRole === 'Admin' && (
            <div>
              <label>Сотрудник:</label>
              <select value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required>
                <option value="">-- выберите --</option>
                {employees.map(e => (
                  <option key={e.employeeid} value={e.employeeid}>{e.fio}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label>Дата создания:</label>
            <input type="date" value={formData.createDate} onChange={(e) => setFormData({ ...formData, createDate: e.target.value })} required />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btns">Сохранить</button>
            <button type="button" className="btns" onClick={() => setModalOpen(false)}>Отмена</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
