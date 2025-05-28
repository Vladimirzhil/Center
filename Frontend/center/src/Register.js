import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { IMaskInput } from 'react-imask';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage = () => {
  const [fio, setFio] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleCaptchaChange = (token) => {
    if (token) {
      setCaptchaPassed(true);
      setError('');
    } else {
      setCaptchaPassed(false);
    }
  };

  const handleCaptchaExpired = () => {
    setCaptchaPassed(false);
    setError('Капча истекла. Повторите подтверждение.');
  };

  const handleCaptchaError = () => {
    setCaptchaPassed(false);
    setError('Ошибка загрузки капчи. Проверьте соединение.');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaPassed) {
      setError('Пожалуйста, подтвердите, что вы не робот.');
      return;
    }

    try {
      await axios.post('https://localhost:44397/api/Auth/register/client', {
        fio,
        phone,
        email,
        password,
      });

      const loginRes = await axios.post('https://localhost:44397/api/Auth/login', {
        email,
        password,
      });

      login(loginRes.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Ошибка при регистрации');
    }
  };

  return (
    <div className="profile-card">
      <h2 className="profile-title">Регистрация клиента</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form className="register-form" onSubmit={handleRegister}>
        <input
          placeholder="ФИО"
          value={fio}
          onChange={(e) => setFio(e.target.value)}
          required
        />

        <IMaskInput
        mask="8(000)000-00-00"
        value={phone}
        onAccept={(value) => setPhone(value)}
        placeholder="Телефон"
        type="tel"
        required
        className="your-input-class"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
             aria-label="Показать или скрыть пароль"
            >
            {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
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
          <button style={{marginTop: '-10px', marginBottom:'15px'}} className="btns" disabled={!captchaPassed}>
            Зарегистрироваться
          </button>
        </div>
      </form>

      <p style={{ fontSize: '20px' }}>
        Есть аккаунт? <Link className="links" to="/login">Войти</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
