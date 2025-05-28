// Компонент управления сотрудниками (Employers)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function Employers() {
  const [employees, setEmployees] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeid: null,
    fio: '',
    phone: '',
    jobTitleId: '',
    brigadeId: ''
  });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [empRes, brigRes, jobRes] = await Promise.all([
        axios.get('https://localhost:44397/api/Employee', config),
        axios.get('https://localhost:44397/api/Brigade', config),
        axios.get('https://localhost:44397/api/JobTitle', config),
      ]);
      setEmployees(empRes.data);
      setBrigades(brigRes.data);
      setJobTitles(jobRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const getBrigadeName = (id) => brigades.find(b => b.brigadeId === id)?.brigadeName || '-';
  const getJobTitleName = (id) => jobTitles.find(j => j.jobTitleId === id)?.jobTitleName || '-';

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        employeeid: item.employeeid,
        fio: item.fio,
        phone: item.phone,
        jobTitleId: item.jobTitleId || '',
        brigadeId: item.brigadeId || ''
      });
    } else {
      setFormData({ employeeid: null, fio: '', phone: '', jobTitleId: '', brigadeId: '' });
    }
    setModalIsOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    const payload = {
      fio: formData.fio,
      phone: formData.phone,
      jobTitleId: formData.jobTitleId ? Number(formData.jobTitleId) : null,
      brigadeId: formData.brigadeId ? Number(formData.brigadeId) : null
    };
    try {
      if (formData.employeeid) {
        await axios.put(`https://localhost:44397/api/Employee/${formData.employeeid}`, payload, config);
      } else {
        await axios.post('https://localhost:44397/api/Employee', payload, config);
      }
      setModalIsOpen(false);
      fetchData(token);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Удалить сотрудника?')) return;
    try {
      await axios.delete(`https://localhost:44397/api/Employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Сотрудники</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить сотрудника</button>
      )}

      <div className="table-responsive">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Должность</th>
              <th>Бригада</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.employeeid}>
                <td>{emp.employeeid}</td>
                <td>{emp.fio}</td>
                <td>{emp.phone}</td>
                <td>{getJobTitleName(emp.jobTitleId)}</td>
                <td>{getBrigadeName(emp.brigadeId)}</td>
                {userRole === 'Admin' && (
                  <td><button className="btns" onClick={() => openModal(emp)}>Изменить</button></td>
                )}
                {userRole === 'Admin' && (
                  <td><button className="btns delete-btn" onClick={() => handleDelete(emp.employeeid)}>Удалить</button></td>
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
        contentLabel="Форма сотрудника"
      >
        <h2>{formData.employeeid ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>ФИО:</label>
            <input type="text" value={formData.fio} onChange={(e) => setFormData({ ...formData, fio: e.target.value })} required />
          </div>
          <div>
            <label>Телефон:</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div>
            <label>Должность:</label>
            <select value={formData.jobTitleId} onChange={(e) => setFormData({ ...formData, jobTitleId: e.target.value })}>
              <option value="">-- выберите --</option>
              {jobTitles.map(j => (
                <option key={j.jobTitleId} value={j.jobTitleId}>{j.jobTitleName}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Бригада:</label>
            <select value={formData.brigadeId} onChange={(e) => setFormData({ ...formData, brigadeId: e.target.value })}>
              <option value="">-- без бригады --</option>
              {brigades.map(b => (
                <option key={b.brigadeId} value={b.brigadeId}>{b.brigadeName}</option>
              ))}
            </select>
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