import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';

Modal.setAppElement('#root');

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [employeeModalIsOpen, setEmployeeModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: null,
    email: '',
    passwordHash: '',
    roleId: '',
    clientId: '',
    employeeId: ''
  });
  const [employeeFormData, setEmployeeFormData] = useState({
    fio: '',
    phone: '',
    jobTitleId: '',
    brigadeId: '',
    email: '',
    password: ''
  });
  const [userRole, setUserRole] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const navigate = useNavigate();

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
      const [userRes, roleRes, clientRes, empRes, jobRes, brigRes] = await Promise.all([
        axios.get('https://localhost:44397/api/Users', config),
        axios.get('https://localhost:44397/api/Roles', config),
        axios.get('https://localhost:44397/api/Client', config),
        axios.get('https://localhost:44397/api/Employee', config),
        axios.get('https://localhost:44397/api/JobTitle', config),
        axios.get('https://localhost:44397/api/Brigade', config)
      ]);
      setUsers(userRes.data);
      setRoles(roleRes.data);
      setClients(clientRes.data);
      setEmployees(empRes.data);
      setJobTitles(jobRes.data);
      setBrigades(brigRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const getRoleName = (id) => roles.find(r => r.roleId === id)?.roleName || `Роль #${id}`;
  const getClientName = (id) => clients.find(c => c.clientId === id)?.fio;
  const getEmployeeName = (id) => employees.find(e => e.employeeid === id)?.fio;

  const openModal = (user = null) => {
    if (user) {
      setFormData({
        userId: user.userId,
        email: user.email,
        passwordHash: '',
        roleId: user.roleId,
        clientId: user.clientId || '',
        employeeId: user.employeeId || ''
      });
    } else {
      setFormData({ userId: null, email: '', passwordHash: '', roleId: '', clientId: '', employeeId: '' });
    }
    setModalIsOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    const payload = {
      email: formData.email,
      passwordHash: formData.passwordHash,
      roleId: Number(formData.roleId),
      clientId: formData.clientId ? Number(formData.clientId) : null,
      employeeId: formData.employeeId ? Number(formData.employeeId) : null
    };

    try {
      if (formData.userId) {
        await axios.put(`https://localhost:44397/api/Users/${formData.userId}`, payload, config);
      } else {
        await axios.post('https://localhost:44397/api/Users', payload, config);
      }
      setModalIsOpen(false);
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleEmployeeRegister = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    try {
      await axios.post('https://localhost:44397/api/Auth/register/employee', employeeFormData, config);
      setEmployeeModalIsOpen(false);
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка регистрации сотрудника:', err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await axios.delete(`https://localhost:44397/api/Users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAll(token);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="applications-container">
      <h1>Пользователи</h1>

      {userRole === 'Admin' && (
        <>
          <button className="btns" onClick={() => openModal()}>Добавить пользователя</button>
          <button className="btns" onClick={() => setEmployeeModalIsOpen(true)} style={{ marginLeft: '10px' }}>
            Зарегистрировать сотрудника
          </button>
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Поиск по email"
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        style={{ padding: '8px', width: '100%', borderRadius: '10px', border: '1.5px solid #303030' }}
      />
      </div>
      <div className="table-responsive">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Клиент</th>
              <th>Сотрудник</th>
              {userRole === 'Admin' && <th>Изменить</th>}
              {userRole === 'Admin' && <th>Удалить</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.email}</td>
                <td>{getRoleName(user.roleId)}</td>
                <td>{user.clientId ? getClientName(user.clientId) : '-'}</td>
                <td>{user.employeeId ? getEmployeeName(user.employeeId) : '-'}</td>
                {userRole === 'Admin' && (
                  <td><button className="btns" onClick={() => openModal(user)}>Изменить</button></td>
                )}
                {userRole === 'Admin' && (
                  <td><button className="btns delete-btn" onClick={() => handleDelete(user.userId)}>Удалить</button></td>
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
        contentLabel="Форма пользователя"
      >
        <h2>{formData.userId ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Email:</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <label>Пароль:</label>
            <input type="password" value={formData.passwordHash} onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })} required />
          </div>
          <div>
            <label>Роль:</label>
            <select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} required>
              <option value="">-- выберите --</option>
              {roles.map(r => (
                <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Клиент:</label>
            <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}>
              <option value="">-- не выбрано --</option>
              {clients.map(c => (
                <option key={c.clientId} value={c.clientId}>{c.fio}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Сотрудник:</label>
            <select value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}>
              <option value="">-- не выбрано --</option>
              {employees.map(e => (
                <option key={e.employeeid} value={e.employeeid}>{e.fio}</option>
              ))}
            </select>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btns">Сохранить</button>
            <button type="button" className="btns" onClick={() => setModalIsOpen(false)}>Отмена</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={employeeModalIsOpen}
        onRequestClose={() => setEmployeeModalIsOpen(false)}
        className="custom-modal"
        contentLabel="Регистрация сотрудника"
      >
        <h2>Регистрация сотрудника</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleEmployeeRegister(); }}>
          <div>
            <label>ФИО:</label>
            <input type="text" value={employeeFormData.fio} onChange={(e) => setEmployeeFormData({ ...employeeFormData, fio: e.target.value })} required />
          </div>
          <div>
            <label>Телефон:</label>
            <IMaskInput mask="8(000)000-00-00" value={employeeFormData.phone} onAccept={(value) => setEmployeeFormData({ ...employeeFormData, phone: value })} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={employeeFormData.email} onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })} required />
          </div>
          <div>
            <label>Пароль:</label>
            <input type="password" value={employeeFormData.password} onChange={(e) => setEmployeeFormData({ ...employeeFormData, password: e.target.value })} required />
          </div>
          <div>
            <label>Должность:</label>
            <select value={employeeFormData.jobTitleId} onChange={(e) => setEmployeeFormData({ ...employeeFormData, jobTitleId: e.target.value })} required>
              <option value="">-- выберите должность --</option>
              {jobTitles.map(j => (
                <option key={j.jobTitleId} value={j.jobTitleId}>{j.jobTitleName}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Бригада:</label>
            <select value={employeeFormData.brigadeId} onChange={(e) => setEmployeeFormData({ ...employeeFormData, brigadeId: e.target.value })}>
              <option value="">-- без бригады --</option>
              {brigades.map(b => (
                <option key={b.brigadeId} value={b.brigadeId}>{b.brigadeName}</option>
              ))}
            </select>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btns">Зарегистрировать</button>
            <button type="button" className="btns" onClick={() => setEmployeeModalIsOpen(false)}>Отмена</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}