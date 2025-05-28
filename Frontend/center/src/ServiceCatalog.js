import React, { useEffect, useState } from 'react';

export default function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://localhost:44397/api/ServiceCatalog')
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
        setFilteredServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке данных:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = services.filter(service =>
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="catalog-card">
      <h2>Каталог услуг</h2>
      <input
        type="text"
        placeholder="Поиск по наименованию..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '10px', padding: '8px', width: '98.75%', borderRadius: '10px', border: '1.5px solid #303030' }}
      />
      <table className="service-table">
        <thead>
          <tr>
            <th>Наименование услуги</th>
            <th>Цена</th>
            <th>Ед. изм.</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((service) => (
            <tr key={service.serviceId}>
              <td>{service.serviceName}</td>
              <td>{service.price}</td>
              <td>{service.measurement}</td>
              <td>{service.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}