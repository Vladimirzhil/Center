// Компонент управления должностями (Job Titles)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';

Modal.setAppElement('#root');

export default function Jobtitles() {
  const [jobTitles, setJobTitles] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobTitleId: null,
    jobTitleName: ''
  });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    fetchJobTitles(token);
  }, []);

  const fetchJobTitles = async (token) => {
    try {
      const res = await axios.get('https://localhost:44397/api/JobTitle', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobTitles(res.data);
    } catch (err) {
      console.error('Ошибка загрузки должностей:', err);
    }
  };

  const openModal = (job = null) => {
    if (job) {
      setFormData({ jobTitleId: job.jobTitleId, jobTitleName: job.jobTitleName });
    } else {
      setFormData({ jobTitleId: null, jobTitleName: '' });
    }
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
    const payload = { jobTitleName: formData.jobTitleName };

    try {
      if (formData.jobTitleId) {
        await axios.put(`https://localhost:44397/api/JobTitle/${formData.jobTitleId}`, payload, config);
      } else {
        await axios.post('https://localhost:44397/api/JobTitle', payload, config);
      }
      setModalIsOpen(false);
      fetchJobTitles(token);
    } catch (err) {
      console.error('Ошибка сохранения должности:', err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Удалить должность?')) return;
    try {
      await axios.delete(`https://localhost:44397/api/JobTitle/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobTitles(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="applications-container">
      <h1>Должности</h1>

      {userRole === 'Admin' && (
        <button className="btns" onClick={() => openModal()}>Добавить должность</button>
      )}

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
            {jobTitles.map(job => (
              <tr key={job.jobTitleId}>
                <td>{job.jobTitleId}</td>
                <td>{job.jobTitleName}</td>
                {userRole === 'Admin' && (
                  <td><button className="btns" onClick={() => openModal(job)}>Изменить</button></td>
                )}
                {userRole === 'Admin' && (
                  <td><button className="btns delete-btn" onClick={() => handleDelete(job.jobTitleId)}>Удалить</button></td>
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
        contentLabel="Форма должности"
      >
        <h2>{formData.jobTitleId ? 'Редактировать должность' : 'Добавить должность'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Название:</label>
            <input
              type="text"
              value={formData.jobTitleName}
              onChange={(e) => setFormData({ ...formData, jobTitleName: e.target.value })}
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