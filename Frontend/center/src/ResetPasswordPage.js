import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 👈 добавим иконки

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); // 👈
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [message, setMessage] = useState('');

  const handleCaptchaChange = (token) => {
    setCaptchaPassed(!!token);
    setMessage('');
  };

  const handleCaptchaExpired = () => {
    setCaptchaPassed(false);
    setMessage('Капча истекла. Повторите подтверждение.');
  };

  const handleCaptchaError = () => {
    setCaptchaPassed(false);
    setMessage('Ошибка загрузки капчи. Проверьте соединение.');
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
      });

      setMessage('Пароль успешно обновлён!');
    } catch (error) {
      setMessage('Ошибка при обновлении пароля: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div className="profile-card">
      <h2 className="profile-title">Сброс пароля</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: 'relative' }}>
          <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Новый пароль"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            style={{
              position: 'absolute',
              right: '25px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
            aria-label="Показать или скрыть новый пароль"
          >
            {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Повторите пароль"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '25px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
            aria-label="Показать или скрыть повтор пароля"
          >
            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <div style={{ overflow: 'hidden' }}>
            <ReCAPTCHA
              sitekey="6Le3XkYrAAAAAMT3jfLzb41aHBafEBieozm1NxAV"
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpired}
              onErrored={handleCaptchaError}
            />
          </div>
        </div>

        <div className="button-center">
          <Link to="/login">
          <button style={{marginTop: '-10px', marginBottom:'15px'
          }} className="btns" type="submit" disabled={!captchaPassed}>
            Сбросить пароль
          </button>
          </Link>
        </div>

        <p style={{ fontSize: '20px' }}>
          Нет аккаунта? <Link className="links" to="/register">Зарегистрироваться</Link>
        </p>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPasswordPage;
