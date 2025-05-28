import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt,FaChartBar,FaRegCalendarAlt ,FaPencilAlt,FaRegBuilding ,FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { MdOutlineEventNote,MdCurrencyRuble } from "react-icons/md";
import { PiNotePencil } from "react-icons/pi";
import { GrUserWorker } from "react-icons/gr";
import { IoBuildOutline } from "react-icons/io5";
import axios from 'axios';
import Modal from 'react-modal';

const ClientObjectsAccordion = () => {
  const [objects, setObjects] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [dataByObject, setDataByObject] = useState({});
  const [statuses, setStatuses] = useState({});
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [addObjectModalOpen, setAddObjectModalOpen] = useState(false);
  const [editObjectModalOpen, setEditObjectModalOpen] = useState(false);
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({ serviceId: '', volume: 1 });
  const [currentApplicationId, setCurrentApplicationId] = useState(null);
  const [currentObject, setCurrentObject] = useState(null);
  const [analysisData, setAnalysisData] = useState([]);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [newObject, setNewObject] = useState({
    organizationName: '',
    inn: '',
    city: '',
    street: '',
    number: '',
    area: '',
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchObjects();
    fetchStatuses();
    fetchServicesCatalog();
    fetchBrigades();
  }, []);

  useEffect(() => {
    const reSortData = async () => {
      const newData = { ...dataByObject };
      
      for (const objectId of expandedIds) {
        if (newData[objectId]) {
          const sorted = [...newData[objectId]].sort((a, b) => {
            const dateA = new Date(a.incomingDate);
            const dateB = new Date(b.incomingDate);
            return sortAsc ? dateA - dateB : dateB - dateA;
          });
          newData[objectId] = sorted;
        }
      }
      
      setDataByObject(newData);
    };

    if (expandedIds.length > 0) {
      reSortData();
    }
  }, [sortAsc]);

  const fetchAnalysisData = async () => {
    try {
      const response = await axios.get('https://localhost:44397/api/Analysis/Client', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных анализа:', error);
    }
  };

   const openAnalysisModal = async () => {
    await fetchAnalysisData();
    setAnalysisModalOpen(true);
  };

  const fetchObjects = async () => {
    try {
      const response = await axios.get('https://localhost:44397/api/ObjectSurveyClient', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObjects(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке объектов:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await axios.get('https://localhost:44397/api/StatusAplication', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusMap = {};
      response.data.forEach((s) => {
        statusMap[s.statusApplicationId] = s.typeStatus;
      });
      setStatuses(statusMap);
    } catch (error) {
      console.error('Ошибка при загрузке статусов:', error);
    }
  };

  const fetchServicesCatalog = async () => {
    try {
      const res = await axios.get('https://localhost:44397/api/ServiceCatalog', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServicesCatalog(res.data);
    } catch (error) {
      console.error('Ошибка при получении каталога услуг:', error);
    }
  };

  const fetchBrigades = async () => {
    try {
      const res = await axios.get('https://localhost:44397/api/Brigade', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrigades(res.data);
    } catch (error) {
      console.error('Ошибка при получении бригад:', error);
    }
  };

  const toggleAccordion = async (objectsurveyid) => {
    const isExpanded = expandedIds.includes(objectsurveyid);

    if (isExpanded) {
      setExpandedIds(prev => prev.filter(id => id !== objectsurveyid));
      return;
    }

    if (dataByObject[objectsurveyid]) {
      const sorted = [...dataByObject[objectsurveyid]].sort((a, b) => {
        const dateA = new Date(a.incomingDate);
        const dateB = new Date(b.incomingDate);
        return sortAsc ? dateA - dateB : dateB - dateA;
      });
      
      setDataByObject(prev => ({
        ...prev,
        [objectsurveyid]: sorted,
      }));
    } 
    else {
      const filteredApplications = await fetchApplicationsByObject(objectsurveyid);
      const sortedApplications = filteredApplications.sort((a, b) => {
        const dateA = new Date(a.incomingDate);
        const dateB = new Date(b.incomingDate);
        return sortAsc ? dateA - dateB : dateB - dateA;
      });

      const fullData = await Promise.all(
        sortedApplications.map(async (app) => {
          const [report, agreement, selectedServices] = await Promise.all([
            fetchReport(app.applicationId),
            fetchAgreement(app.applicationId),
            fetchSelectedServices(app.applicationId),
          ]);
          return { ...app, report, agreement, selectedServices };
        })
      );

      setDataByObject((prev) => ({
        ...prev,
        [objectsurveyid]: fullData,
      }));
    }

    setExpandedIds(prev => [...prev, objectsurveyid]);
  };

  const fetchApplicationsByObject = async (objectsurveyid) => {
    try {
      const response = await axios.get('https://localhost:44397/api/ApplicationClient', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.filter(app => app.objectSurveyId === objectsurveyid);
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
      return [];
    }
  };

  const fetchReport = async (applicationId) => {
    try {
      const res = await axios.get(`https://localhost:44397/api/ApplicationClient/${applicationId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      return null;
    }
  };

  const fetchAgreement = async (applicationId) => {
    try {
      const res = await axios.get(`https://localhost:44397/api/ApplicationClient/${applicationId}/agreement`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      return null;
    }
  };

  const fetchSelectedServices = async (applicationId) => {
    try {
      const res = await axios.get(`https://localhost:44397/api/ApplicationClient/${applicationId}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error('Ошибка при получении услуг:', err);
      return [];
    }
  };

  const confirmAgreement = async (applicationId) => {
  try {
    await axios.patch(`https://localhost:44397/api/ApplicationClient/${applicationId}/agreement/confirm`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Договор подтвержден');

    const objectSurveyId = objects.find(obj =>
      dataByObject[obj.objectsurveyid]?.some(app => app.applicationId === applicationId)
    )?.objectsurveyid;

    if (objectSurveyId) {
      await refreshObjectData(objectSurveyId);
    }

  } catch {
    console.log('Не удалось подтвердить договор');
  }
};


  const downloadReport = async (reportId) => {
    try {
      const response = await axios.get(`https://localhost:44397/api/ApplicationClient/report/download/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании отчёта:', error);
    }
  };

  const createApplication = async (objectSurveyId) => {
  try {
    await axios.post('https://localhost:44397/api/ApplicationClient', {
      objectSurveyId,
      incomingDate: new Date().toISOString(),
      statusApplicationId: 1
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await refreshObjectData(objectSurveyId);
  } catch (err) {
    console.error('Не удалось создать заявку', err);
  }
};

  const handleAddService = async () => {
  try {
    await axios.post(`https://localhost:44397/api/ApplicationClient/${currentApplicationId}/services`, {
      serviceId: newService.serviceId,
      volume: newService.volume
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAddServiceModalOpen(false);

    // Найти объект, которому принадлежит заявка
    const objectSurveyId = objects.find(obj =>
      dataByObject[obj.objectsurveyid]?.some(app => app.applicationId === currentApplicationId)
    )?.objectsurveyid;

    if (objectSurveyId) {
      await refreshObjectData(objectSurveyId);
    }
  } catch (err) {
    console.error('Ошибка при добавлении услуги:', err);
  }
};


  const handleAddObject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:44397/api/ObjectSurveyClient', {
        address: {
          cityName: newObject.city,
          streetName: newObject.street,
          number: newObject.number,
        },
        objectArea: Number(newObject.area),
        organization: {
          organizationName: newObject.organizationName,
          inn: newObject.inn,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Объект успешно добавлен');
      setAddObjectModalOpen(false); 
      setNewObject({ organizationName: '', inn: '', city: '', street: '', number: '', area: '' });
      await fetchObjects(); 
    } catch (error) {
      console.error('Ошибка при добавлении объекта:', error);
    }
  };

  const handleEditObject = (obj) => {
    setCurrentObject(obj);
    setNewObject({
      organizationName: obj.organization?.organizationname || '',
      inn: obj.organization?.inn || '',
      city: obj.address?.cityname || '',
      street: obj.address?.streetname || '',
      number: obj.address?.number || '',
      area: obj.objectarea || '',
    });
    setEditObjectModalOpen(true);
  };

  const handleUpdateObject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://localhost:44397/api/ObjectSurveyClient/${currentObject.objectsurveyid}`, {
        address: {
          cityName: newObject.city,
          streetName: newObject.street,
          number: newObject.number,
        },
        objectArea: Number(newObject.area),
        organization: {
          organizationName: newObject.organizationName,
          inn: newObject.inn,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Объект успешно обновлен');
      setEditObjectModalOpen(false);
      fetchObjects();
    } catch (error) {
      console.error('Ошибка при обновлении объекта:', error);
    }
  };

  const getBrigadeName = (id) => brigades.find(b => b.brigadeId === id)?.brigadeName || '—';
  const getServiceName = (id) => servicesCatalog.find(s => s.serviceId === id)?.serviceName || '—';
  const getServicePrice = (id) => servicesCatalog.find(s => s.serviceId === id)?.price || 0;

  const refreshObjectData = async (objectSurveyId) => {
  const filteredApplications = await fetchApplicationsByObject(objectSurveyId);
  const sortedApplications = filteredApplications.sort((a, b) => {
    const dateA = new Date(a.incomingDate);
    const dateB = new Date(b.incomingDate);
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const fullData = await Promise.all(
    sortedApplications.map(async (app) => {
      const [report, agreement, selectedServices] = await Promise.all([
        fetchReport(app.applicationId),
        fetchAgreement(app.applicationId),
        fetchSelectedServices(app.applicationId),
      ]);
      return { ...app, report, agreement, selectedServices };
    })
  );

  setDataByObject(prev => ({
    ...prev,
    [objectSurveyId]: fullData,
  }));
};


  return (
    <div>
      <h2 className='title2'>Мои объекты</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <button style={{  marginBottom: '15px' }} className='btns' onClick={() => {
        setAddObjectModalOpen(true);
        setNewObject({ organizationName: '', inn: '', city: '', street: '', number: '', area: '' });
      }}><FaPlus style={{fontSize: '1.2em',
  marginBottom: '3px'}}/> Добавить объект</button>
      <button style={{  marginBottom: '15px' }} className='btns' onClick={openAnalysisModal}><FaChartBar style={{fontSize: '1.2em',
  marginBottom: '3px'}}/> Аналитика заявок</button>
      </div>
      {objects.map((obj) => (
        <div key={obj.objectsurveyid} style={{ border: '1px solid #ccc', marginBottom: '10px',marginLeft: '10px', marginRight:'10px', borderRadius: '10px', overflow: 'hidden'  }}>
          <div
            style={{ 
              background: '#eee', 
              padding: '10px', 
              cursor: 'pointer',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={() => toggleAccordion(obj.objectsurveyid)}
          >
            <div>
              <FaMapMarkerAlt className='icon'/> {obj.address?.cityname}, {obj.address?.streetname} {obj.address?.number} | Площадь: {obj.objectarea} м² <br />
              <FaRegBuilding className='icon'/>  {obj.organization?.organizationname} (ИНН: {obj.organization?.inn})
              <button className='cntrlbtn'
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditObject(obj);
                }}
              >
                 <FaPencilAlt/>Изменить
              </button>
            </div>
          </div>

          {expandedIds.includes(obj.objectsurveyid) && (
            <div style={{ padding: '10px', background: '#f9f9f9' }}>
              <button className='cntrlbtn' onClick={() => createApplication(obj.objectsurveyid)}><PiNotePencil className='icon'/> Подать заявку</button>
              <div>
                <p>Сортировка по дате подачи:
                  <button className='cntrlbtn' onClick={() => setSortAsc(true)}><FaArrowUp className='icon'/></button>
                  <button className='cntrlbtn' onClick={() => setSortAsc(false)}><FaArrowDown className='icon'/></button>
                </p>
              </div>
              {dataByObject[obj.objectsurveyid]?.length === 0 ? (
                <p>Нет заявок</p>
              ) : (
                dataByObject[obj.objectsurveyid].map((app) => (
                  <div key={app.applicationId} style={{ border: '1px solid #aaa', marginBottom: '10px', padding: '10px',borderRadius: '10px' }}>
                    <details>
                      <summary><PiNotePencil className='icon'/> Заявка от {new Date(app.incomingDate).toLocaleDateString('ru-RU')} — статус: {statuses[app.statusApplicationId] || 'Неизвестно'}</summary>
                      <p><GrUserWorker className='icon'/> Бригада: {getBrigadeName(app.brigadeId)}</p>
                      <p><FaRegCalendarAlt className='icon'/> Начало обследования: {app.starteDate ? new Date(app.starteDate).toLocaleDateString('ru-RU') : 'обследование не начато'}</p>
                      <p><FaRegCalendarAlt className='icon'/> Окончание обследования: {app.endDate ? new Date(app.endDate).toLocaleDateString('ru-RU') : 'обследование не закончено'}</p>

                      <details>
                        <summary>🛠 Услуги</summary>
                        <hr></hr>
                        {app.report ? (
                          <p>Услуги нельзя редактировать, т.к. уже есть отчет</p>
                        ) : (
                          <button className='cntrlbtn' onClick={() => { setCurrentApplicationId(app.applicationId); setAddServiceModalOpen(true); }}><FaPlus className='icon'/> Добавить услугу</button>
                        )}
                        {app.selectedServices?.length > 0 ? app.selectedServices.map(s => (
                          <p key={s.selectedservicesid}>
                          <IoBuildOutline className='icon'/> 
                          {getServiceName(s.serviceid)} — 
                          {s.volume} × {getServicePrice(s.serviceid).toLocaleString('ru-RU')} <MdCurrencyRuble className='icon'/> = 
                          {s.costservices.toLocaleString('ru-RU')} <MdCurrencyRuble className='icon'/>
                          </p>
                        )) : <p>Нет услуг</p>}
                      </details>
                      <hr></hr>
                      <details>
                        <summary><MdOutlineEventNote className='icon'/> Договор</summary>
                        {app.agreement ? (
                          <>
                            <p><FaRegCalendarAlt className='icon'/> Сформирован: {new Date(app.agreement.createdate).toLocaleDateString('ru-RU')}</p>
                            <p>Подтверждение: {app.agreement.confirmation ? '☑ Да' : '☒ Нет'}</p>
                            <p>Стоимость по договору: {app.agreement.pricefororder.toLocaleString('ru-RU')} <MdCurrencyRuble className='icon'/></p>
                            {!app.agreement.confirmation && (
                              <button className='cntrlbtn' onClick={() => confirmAgreement(app.applicationId)}>Подтвердить</button>
                            )}
                          </>
                        ) : <p>Отсутствует</p>}
                      </details>

                      {app.report ? (
                        <p><MdOutlineEventNote className='icon'/> Отчёт: <button className='cntrlbtn' onClick={() => downloadReport(app.report.reportid)}>Скачать</button></p>
                      ) : (
                        <p><MdOutlineEventNote className='icon'/> Отчёт: нет</p>
                      )}
                    </details>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
          <Modal 
        className='custom-modal' 
        isOpen={analysisModalOpen} 
        onRequestClose={() => setAnalysisModalOpen(false)} 
        contentLabel="Аналитика заявок"
        style={{
          content: {
            maxWidth: '1000px',
          }
        }}
      >
        <h2>Аналитика заявок</h2>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Объект</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Бригада</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата подачи</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Статус</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Начало обследования</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Окончание обследования</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата договора</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {item.cityname}, {item.streetname} {item.number}<br />
                    {item.organizationname} (ИНН: {item.inn})<br />
                    Площадь: {item.objectarea} м²
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.brigadename}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {new Date(item.incomingdate).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.status}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {item.startedate ? new Date(item.startedate).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {item.enddate ? new Date(item.enddate).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {item.createdate ? new Date(item.createdate).toLocaleDateString('ru-RU') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button className='btns' onClick={() => setAnalysisModalOpen(false)}>Закрыть</button>
        </div>
      </Modal>
         <Modal className='custom-modal' isOpen={addObjectModalOpen} onRequestClose={() => setAddObjectModalOpen(false)} contentLabel="Добавить объект">
      <h2>Добавление объекта</h2>
      <form onSubmit={handleAddObject}>
        <label>
          <span className="label-text">Название организации:</span>
          <input type="text" value={newObject.organizationName} onChange={(e) => setNewObject(prev => ({ ...prev, organizationName: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">ИНН организации:</span>
          <input type="text" value={newObject.inn} onChange={(e) => setNewObject(prev => ({ ...prev, inn: e.target.value }))} required />
       </label>
       <label>
          <span className="label-text">Город:</span>
          <input type="text" value={newObject.city} onChange={(e) => setNewObject(prev => ({ ...prev, city: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">Улица:</span>
          <input type="text" value={newObject.street} onChange={(e) => setNewObject(prev => ({ ...prev, street: e.target.value }))} required />
        </label>
       <label>
          <span className="label-text">Номер дома:</span>
          <input type="text" value={newObject.number} onChange={(e) => setNewObject(prev => ({ ...prev, number: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">Площадь (м²):</span>
          <input type="number" value={newObject.area} onChange={(e) => setNewObject(prev => ({ ...prev, area: e.target.value }))} min="1" required />
        </label>
       <div className='modal-buttons'>
          <button className='btns' type="submit">Добавить объект</button>
          <button className='btns' type="button" onClick={() => setAddObjectModalOpen(false)}>Отмена</button>
        </div>
      </form>
    </Modal>

    <Modal className='custom-modal' isOpen={editObjectModalOpen} onRequestClose={() => setEditObjectModalOpen(false)} contentLabel="Редактировать объект">
      <h2>Редактирование объекта</h2>
      <form onSubmit={handleUpdateObject}>
        <label>
          <span className="label-text">Название организации:</span>
          <input type="text" value={newObject.organizationName} onChange={(e) => setNewObject(prev => ({ ...prev, organizationName: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">ИНН организации:</span>
          <input type="text" value={newObject.inn} onChange={(e) => setNewObject(prev => ({ ...prev, inn: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">Город:</span>
          <input type="text" value={newObject.city} onChange={(e) => setNewObject(prev => ({ ...prev, city: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">Улица:</span>
          <input type="text" value={newObject.street} onChange={(e) => setNewObject(prev => ({ ...prev, street: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">Номер дома:</span>
          <input type="text" value={newObject.number} onChange={(e) => setNewObject(prev => ({ ...prev, number: e.target.value }))} required />
        </label>
        <label>
          <span className="label-text">Площадь (м²):</span>
          <input type="number" value={newObject.area} onChange={(e) => setNewObject(prev => ({ ...prev, area: e.target.value }))} min="1" required />
        </label>
        <div className='modal-buttons'>
          <button className='btns' type="submit">Сохранить изменения</button>
          <button className='btns' type="button" onClick={() => setEditObjectModalOpen(false)}>Отмена</button>
       </div>
      </form>
    </Modal>

    <Modal className='custom-modal' isOpen={addServiceModalOpen} onRequestClose={() => setAddServiceModalOpen(false)} contentLabel="Добавить услугу">
      <h2>Добавить услугу</h2>
      <label>
        <span className="label-text">Услуга:</span>
        <select value={newService.serviceId} onChange={(e) => setNewService(prev => ({ ...prev, serviceId: e.target.value }))}>
          <option value="">-- Выбрать --</option>
          {servicesCatalog.map(s => (
            <option key={s.serviceId} value={s.serviceId}>{s.serviceName}</option>
       ))}
      </select>
      </label>
      <label>
        <span className="label-text">Объём:</span>
        <input type="number" value={newService.volume} onChange={(e) => setNewService(prev => ({ ...prev, volume: Number(e.target.value) }))} min="1" />
      </label>
      <p>
       Стоимость: {newService.serviceId ? (getServicePrice(Number(newService.serviceId)) * newService.volume).toLocaleString('ru-RU') : 0} ₽
      </p>
      <div className='modal-buttons'>
        <button className='btns' onClick={handleAddService}>Добавить</button>
        <button className='btns' onClick={() => setAddServiceModalOpen(false)}>Отмена</button>
      </div>
    </Modal>

    </div>
  );
};

export default ClientObjectsAccordion;