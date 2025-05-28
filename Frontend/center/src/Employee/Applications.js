import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';


Modal.setAppElement('#root');

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        applicationId: '',
        clientId: '',
        objectSurveyId: '',
        brigadeId: '',
        incomingDate: new Date().toISOString().split('T')[0],
        statusApplicationId: '',
        starteDate: '',
        endDate: ''
    });
    const [userRole, setUserRole] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [clients, setClients] = useState([]);
    const [objects, setObjects] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [brigades, setBrigades] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [sortDateAsc, setSortDateAsc] = useState(true);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Требуется авторизация');
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
            fetchAllData(token);
        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            setError('Неверный токен');
            setLoading(false);
        }
    }, []);

    const fetchAllData = async (token) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const [
                appsRes,
                statusesRes,
                clientsRes,
                objectsRes,
                addressesRes,
                orgsRes,
                brigadesRes
            ] = await Promise.all([
                axios.get('https://localhost:44397/api/Application', config),
                axios.get('https://localhost:44397/api/StatusAplication', config),
                axios.get('https://localhost:44397/api/Client', config),
                axios.get('https://localhost:44397/api/ObjectSurvey', config),
                axios.get('https://localhost:44397/api/Address', config),
                axios.get('https://localhost:44397/api/Organization', config),
                axios.get('https://localhost:44397/api/Brigade', config)
            ]);

            setApplications(appsRes.data);
            setStatuses(statusesRes.data);
            setClients(clientsRes.data);
            setObjects(objectsRes.data);
            setAddresses(addressesRes.data);
            setOrganizations(orgsRes.data);
            setBrigades(brigadesRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setError(`Ошибка при загрузке данных: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications
    .filter(app => {
        const client = clients.find(c => c.clientId === app.clientId);
        return !clientSearch || (client?.fio?.toLowerCase().includes(clientSearch.toLowerCase()));
    })
    .sort((a, b) => {
        const dateA = new Date(a.incomingDate);
        const dateB = new Date(b.incomingDate);
        return sortDateAsc ? dateA - dateB : dateB - dateA;
    });

    const getClientName = (clientId) => {
        const client = clients.find(c => c.clientId === clientId);
        return client ? client.fio : `Клиент #${clientId}`;
    };

    const getObjectInfo = (objectSurveyId) => {
        const object = objects.find(o => o.objectSurveyId === objectSurveyId);
        if (!object) return `Объект #${objectSurveyId}`;

        const address = addresses.find(a => a.addressId === object.addressId);
        const org = organizations.find(o => o.organizationId === object.organizationId);

        const addressStr = address 
            ? `${address.cityName}, ${address.streetName} ${address.number}` 
            : 'Адрес не указан';

        return org 
            ? `${org.organizationName} (${addressStr})` 
            : `Объект #${objectSurveyId} (${addressStr})`;
    };

    const getBrigadeName = (brigadeId) => {
        const brigade = brigades.find(b => b.brigadeId === brigadeId);
        return brigade ? brigade.brigadeName : `-`;
    };

    const getStatusName = (statusId) => {
        const status = statuses.find(s => s.statusApplicationId === statusId);
        return status ? status.typeStatus : `Статус #${statusId}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Требуется авторизация');
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const payload = {
            objectSurveyId: Number(formData.objectSurveyId),
            clientId: Number(formData.clientId),
            incomingDate: formData.incomingDate,
            statusApplicationId: Number(formData.statusApplicationId),
            starteDate: formData.starteDate ? formData.starteDate : null,
            endDate: formData.endDate ? formData.endDate : null,
            brigadeId: formData.brigadeId ? Number(formData.brigadeId) : null
            };

            if (formData.applicationId) {
                await axios.put(
                    `https://localhost:44397/api/Application/${formData.applicationId}`,
                    payload,
                    config
                );
            } else {
                await axios.post(
                    'https://localhost:44397/api/Application',
                    payload,
                    config
                );
            }

            setModalIsOpen(false);
            fetchAllData(token);
        } catch (error) {
            console.error('Ошибка сохранения заявки:', error);
            setError(`Ошибка сохранения: ${error.response?.data || error.message}`);
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Требуется авторизация');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите удалить эту заявку?')) return;

        try {
            await axios.delete(
                `https://localhost:44397/api/Application/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            fetchAllData(token);
        } catch (error) {
            console.error('Ошибка удаления заявки:', error);
            setError(`Ошибка удаления: ${error.response?.data || error.message}`);
        }
    };

    const openEditModal = (app) => {
        setFormData({
            applicationId: app.applicationId,
            clientId: app.clientId,
            objectSurveyId: app.objectSurveyId,
            brigadeId: app.brigadeId || '',
            incomingDate: app.incomingDate.split('T')[0],
            statusApplicationId: app.statusApplicationId,
            starteDate: app.starteDate ? app.starteDate.split('T')[0] : '',
            endDate: app.endDate ? app.endDate.split('T')[0] : ''
        });
        setModalIsOpen(true);
    };

    if (loading) {
        return <div className="loading">Загрузка данных...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="applications-container">
            <h1>Управление заявками</h1>

            {(userRole === 'Admin' || userRole === 'Employee') && (
                <button
                    className="btns"
                    onClick={() => {
                        setFormData({
                            applicationId: '',
                            clientId: clients[0]?.clientId || '',
                            objectSurveyId: objects[0]?.objectSurveyId || '',
                            brigadeId: '',
                            incomingDate: new Date().toISOString().split('T')[0],
                            statusApplicationId: statuses[0]?.statusApplicationId || '',
                            starteDate: '',
                            endDate: ''
                        });
                        setModalIsOpen(true);
                    }}
                >
                    Добавить заявку
                </button>
            )}
            <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px', 
    marginBottom: '20px' 
}}>
    <input
        type="text"
        placeholder="Фильтр по ФИО клиента"
        value={clientSearch}
        onChange={(e) => setClientSearch(e.target.value)}
        style={{
            padding: '8px',
            width: '100%',
            borderRadius: '10px',
            border: '1.5px solid #303030'
        }}
    />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>Дата поступления</span>
        <button
            type="button"
            className="cntrlbtn"
            onClick={() => setSortDateAsc(true)}
            title="Сортировать по дате ↑"
        >
            <FaArrowUp />
        </button>
        <button
            type="button"
            className="cntrlbtn"
            onClick={() => setSortDateAsc(false)}
            title="Сортировать по дате ↓"
        >
            <FaArrowDown />
        </button>
    </div>
</div>
            <div className="table-responsive">
                <table className="applications-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Клиент</th>
                            <th>Объект</th>
                            <th>Бригада</th>
                            <th>Дата поступления</th>
                            <th>Статус</th>
                            <th>Дата начала</th>
                            <th>Дата окончания</th>
                            {(userRole === 'Admin' || userRole === 'Employee') && <th>Изменить</th>}
                            {userRole === 'Admin' && <th>Удалить</th>}
                        </tr>
                    </thead>
                    <tbody>
    {filteredApplications.length > 0 ? (
        filteredApplications.map(app => (
            <tr key={app.applicationId}>
                <td>{app.applicationId}</td>
                <td>{getClientName(app.clientId)}</td>
                <td>{getObjectInfo(app.objectSurveyId)}</td>
                <td>{getBrigadeName(app.brigadeId)}</td>
                <td>{app.incomingDate.split('T')[0]}</td>
                <td>{getStatusName(app.statusApplicationId)}</td>
                <td>{app.starteDate ? app.starteDate.split('T')[0] : '-'}</td>
                <td>{app.endDate ? app.endDate.split('T')[0] : '-'}</td>
                {(userRole === 'Admin' || userRole === 'Employee') && (
                    <td>
                        <button className="btns edit-btn" onClick={() => openEditModal(app)}>
                            Изменить
                        </button>
                    </td>
                )}
                {userRole === 'Admin' && (
                    <td>
                        <button className="btns delete-btn" onClick={() => handleDelete(app.applicationId)}>
                            Удалить
                        </button>
                    </td>
                )}
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan={userRole === 'Admin' ? 10 : 9} className="no-data">
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
                contentLabel="Форма заявки"
            >
                <h2>{formData.applicationId ? 'Редактировать заявку' : 'Добавить заявку'}</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Клиент:</label>
                        <select name="clientId" value={formData.clientId} onChange={handleInputChange} required>
                            {clients.map(client => (
                                <option key={client.clientId} value={client.clientId}>
                                    {client.fio} ({client.phone})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Объект:</label>
                        <select name="objectSurveyId" value={formData.objectSurveyId} onChange={handleInputChange} required>
                            {objects.map(obj => {
                                const org = organizations.find(o => o.organizationId === obj.organizationId);
                                const addr = addresses.find(a => a.addressId === obj.addressId);
                                const orgName = org ? org.organizationName : `Орг. #${obj.organizationId}`;
                                const addressStr = addr ? `${addr.cityName}, ${addr.streetName} ${addr.number}` : 'Адрес не указан';
                                return (
                                    <option key={obj.objectSurveyId} value={obj.objectSurveyId}>
                                        {`${orgName} - ${addressStr} - ${obj.area} м²`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label>Бригада:</label>
                        <select name="brigadeId" value={formData.brigadeId} onChange={handleInputChange}>
                            <option value="">-- не выбрана --</option>
                            {brigades.map(brigade => (
                                <option key={brigade.brigadeId} value={brigade.brigadeId}>
                                    {brigade.brigadeName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Статус:</label>
                        <select name="statusApplicationId" value={formData.statusApplicationId} onChange={handleInputChange} required>
                            {statuses.map(status => (
                                <option key={status.statusApplicationId} value={status.statusApplicationId}>
                                    {status.typeStatus}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Дата поступления:</label>
                        <input type="date" name="incomingDate" value={formData.incomingDate} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label>Дата начала:</label>
                        <input type="date" name="starteDate" value={formData.starteDate} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label>Дата окончания:</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                    </div>
                    <div className="modal-buttons">
                        <button type="submit" className="btns ">Сохранить</button>
                        <button type="button" className="btns" onClick={() => setModalIsOpen(false)}>Отмена</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
