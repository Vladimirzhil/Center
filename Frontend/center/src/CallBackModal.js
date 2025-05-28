import React, { useState, useEffect } from "react";
import Modal from "react-modal";

// обязательно, иначе будут ошибки на accessibility
Modal.setAppElement("#root");

function CallbackModal({ onClose, isOpen }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("https://localhost:44397/api/ServiceCatalog")
        .then(res => res.json())
        .then(data => setServices(data))
        .catch(err => console.error("Ошибка загрузки услуг", err));
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const mailBody = `
Имя: ${name}
Телефон: ${phone}
Услуга: ${selectedService}
Доп. информация: ${message}
    `;

    window.location.href = `mailto:vova41001@gmail.com?subject=Обратный звонок&body=${encodeURIComponent(mailBody)}`;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="custom-modal"
      overlayClassName="custom-overlay"
    >
      <h2>Заказать обратный звонок</h2>
      <p style={{ textAlign: "center" }}>
        В ближайшее время наш менеджер свяжется с Вами и предоставит всю необходимую информацию
      </p>

      <label className="label-text">Имя</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      <label className="label-text">Телефон</label>
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

      <label className="label-text">Услуги</label>
      <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
        <option value="">Выберите услугу</option>
        {services.map((service) => (
          <option key={service.id} value={service.serviceName}>
            {service.serviceName}
          </option>
        ))}
      </select>

      <label className="label-text">Дополнительная информация</label>
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />

      <div className="modal-buttons">
        <button className="btn" onClick={handleSubmit}>Перезвоните мне</button>
        <button className="btn" onClick={onClose}>Отмена</button>
      </div>
    </Modal>
  );
}

export default CallbackModal;
