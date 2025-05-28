import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function SurveyReports() {
  const [reports, setReports] = useState([]);
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [objects, setObjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [editingReport, setEditingReport] = useState(null);
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
      const [reportsRes, appsRes, empRes, cliRes, objRes, addrRes] = await Promise.all([
        axios.get('https://localhost:44397/api/SurveyReport', config),
        axios.get('https://localhost:44397/api/Application', config),
        axios.get('https://localhost:44397/api/Employee', config),
        axios.get('https://localhost:44397/api/Client', config),
        axios.get('https://localhost:44397/api/ObjectSurvey', config),
        axios.get('https://localhost:44397/api/Address', config),
      ]);
      setReports(reportsRes.data);
      setApplications(appsRes.data);
      setEmployees(empRes.data);
      setClients(cliRes.data);
      setObjects(objRes.data);
      setAddresses(addrRes.data);
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

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.employeeid === id);
    return emp ? emp.fio : '—';
  };

  const openModal = (report = null) => {
    setEditingReport(report);
    setSelectedApplication(report ? report.applicationId : '');
    setSelectedEmployee(report ? report.employeeId : '');
    setSelectedFile(null);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleUpload = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedFile) return;
    const formData = new FormData();
    formData.append('ApplicationId', selectedApplication || editingReport?.applicationId);
    formData.append('EmployeeId', userRole === 'Admin' ? selectedEmployee : employeeId);
    formData.append('File', selectedFile);

    const url = editingReport
      ? 'https://localhost:44397/api/SurveyReport/update'
      : 'https://localhost:44397/api/SurveyReport/upload';

    if (editingReport) {
      formData.append('ReportId', editingReport.reportId);
    }

    try {
      await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setModalOpen(false);
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка загрузки отчета:', err);
      const message = err.response?.data?.error || 'Ошибка загрузки отчета. Проверьте данные.';
      setErrorMessage(message);
    }
  };

  const handleDownload = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`https://localhost:44397/api/SurveyReport/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Отчет_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Ошибка при скачивании:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отчет?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44397/api/SurveyReport/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert(err.response?.data?.error || 'Ошибка удаления отчета');
    }
  };

  const filteredReports = reports.filter(r =>
    searchAppId === '' || r.applicationId?.toString().includes(searchAppId)
  );

  return (
    <div className="applications-container">
      <h1>Отчёты по обследованиям</h1>

      <button className="btns" onClick={() => openModal()}>Добавить отчёт</button>
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
            <th>Сотрудник</th>
            <th>Файл</th>
            <th>Скачать</th>
            <th>Изменить</th>
            {userRole === 'Admin' &&<th>Удалить</th>}
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(r => (
            <tr key={r.reportId}>
              <td>{r.reportId}</td>
              <td>{r.applicationId} — {getApplicationInfo(r.applicationId)}</td>
              <td>{getEmployeeName(r.employeeId)}</td>
              <td>{r.fileReport}</td>
              <td>
                <button className="btns" onClick={() => handleDownload(r.reportId)}>Скачать</button>
              </td>
              <td>
                <button className="btns" onClick={() => openModal(r)}>Изменить</button>
                </td>
              <td> 
                {userRole === 'Admin' && <button className="btns delete-btn" onClick={() => handleDelete(r.reportId)}>Удалить</button>}
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
        contentLabel="Редактировать отчёт"
      >
        <h2>{editingReport ? 'Обновить отчёт' : 'Новый отчёт'}</h2>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div>
          <label>Заявка:</label>
          <select
            value={selectedApplication || editingReport?.applicationId || ''}
            onChange={(e) => setSelectedApplication(e.target.value)}
            required
          >
            <option value="">-- выберите заявку --</option>
            {applications.map(app => (
              <option key={app.applicationId} value={app.applicationId}>
                {app.applicationId} — {getApplicationInfo(app.applicationId)}
              </option>
            ))}
          </select>
        </div>

        {userRole === 'Admin' && (
          <div>
            <label>Сотрудник:</label>
            <select
              value={selectedEmployee || ''}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
            >
              <option value="">-- выберите сотрудника --</option>
              {employees.map(e => (
                <option key={e.employeeid} value={e.employeeid}>{e.fio}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Файл отчета:</label>
          <input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
        </div>
        <div className="modal-buttons">
          <button className="btns" onClick={handleUpload}>Сохранить</button>
          <button className="btns" onClick={() => setModalOpen(false)}>Отмена</button>
        </div>
      </Modal>
    </div>
  );
}