import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";
import axios from 'axios';

const ClientObjectsAccordion = () => {
  const [objects, setObjects] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [dataByObject, setDataByObject] = useState({});
  const [statuses, setStatuses] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchObjects();
    fetchStatuses();
  }, []);

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

  const toggleAccordion = async (objectsurveyid) => {
    if (expandedId === objectsurveyid) {
      setExpandedId(null);
      return;
    }

    const filteredApplications = await fetchApplicationsByObject(objectsurveyid);
    const fullData = await Promise.all(
      filteredApplications.map(async (app) => {
        const [report, agreement] = await Promise.all([
          fetchReport(app.applicationId),
          fetchAgreement(app.applicationId),
        ]);
        return { ...app, report, agreement };
      })
    );

    setDataByObject((prev) => ({
      ...prev,
      [objectsurveyid]: fullData,
    }));
    setExpandedId(objectsurveyid);
  };

  const fetchApplicationsByObject = async (objectsurveyid) => {
    try {
      const response = await axios.get('https://localhost:44397/api/ApplicationClient', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🎯 Сравнение с objectSurveyId из JSON заявки
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
      alert('Не удалось скачать отчёт');
    }
  };

  return (
    <div>
      <h2>Мои объекты</h2>
      {objects.map((obj) => (
        <div key={obj.objectsurveyid} style={{ border: '1px solid #ccc', marginBottom: '10px' }}>
          <div
            style={{ background: '#eee', padding: '10px', cursor: 'pointer' }}
            onClick={() => toggleAccordion(obj.objectsurveyid)}
          >
            <FaMapMarkerAlt /> {obj.address?.cityname}, {obj.address?.streetname} {obj.address?.number} | Площадь: {obj.objectarea} м² <br />
            🏢 {obj.organization?.organizationname} (ИНН: {obj.organization?.inn})
          </div>

          {expandedId === obj.objectsurveyid && (
            <div style={{ padding: '10px', background: '#f9f9f9' }}>
              {dataByObject[obj.objectsurveyid]?.length === 0 ? (
                <p>Нет заявок</p>
              ) : (
                dataByObject[obj.objectsurveyid].map((app) => (
                  <div key={app.applicationId} style={{ marginBottom: '15px', borderBottom: '1px solid #ddd' }}>
                    <p>📝 Заявка от {new Date(app.incomingDate).toLocaleDateString('ru-RU')} — статус: {statuses[app.statusApplicationId] || 'Неизвестно'}</p>

                    {app.report ? (
                      <p>📄 Отчёт: <button onClick={() => downloadReport(app.report.reportid)}>Скачать</button></p>
                    ) : (
                      <p>📄 Отчёт: нет</p>
                    )}

                    {app.agreement ? (
                      <p>📃 Соглашение: {app.agreement.confirmation ? 'Подтверждено' : 'Не подтверждено'}</p>
                    ) : (
                      <p>📃 Соглашение: отсутствует</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClientObjectsAccordion;
