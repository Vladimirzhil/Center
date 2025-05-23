import React, { useState } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [message, setMessage] = useState('');

  const handleCaptchaChange = (value) => {
    if (value) setCaptchaPassed(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaPassed) {
      setMessage('Пожалуйста, подтвердите, что вы не робот');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }

    try {
      await axios.post('https://localhost:44397/api/Auth/reset-password', {
        email,
        newPassword,
        captchaToken: "frontend-only",
      });

      setMessage('Пароль успешно обновлён!');
    } catch (error) {
      setMessage('Ошибка при обновлении пароля: ' + (error.response?.data || ''));
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Сброс пароля</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Новый пароль:</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Повторите пароль:</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div style={{ margin: '15px 0' }}>
          <ReCAPTCHA
            sitekey="6Le3XkYrAAAAAMT3jfLzb41aHBafEBieozm1NxAV"
            onChange={handleCaptchaChange}
          />
        </div>

        <button type="submit" disabled={!captchaPassed}>
          Сбросить пароль
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPasswordPage;
