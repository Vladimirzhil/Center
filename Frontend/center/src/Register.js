import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

const RegisterPage = () => {
  const [fio, setFio] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Пожалуйста, подтвердите, что вы не робот.');
      return;
    }

    try {
      await axios.post('https://localhost:44397/api/Auth/register/client', {
        fio,
        phone,
        email,
        password
      });

      // автоавторизация
      const loginRes = await axios.post('https://localhost:44397/api/Auth/login', {
        email,
        password
      });

      login(loginRes.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Ошибка при регистрации');
    }
  };

  return (
    <div>
      <h2>Регистрация клиента</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input placeholder="ФИО" value={fio} onChange={(e) => setFio(e.target.value)} required />
        <input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <ReCAPTCHA
          sitekey="6Le3XkYrAAAAAMT3jfLzb41aHBafEBieozm1NxAV"
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />

        <button type="submit" disabled={!captchaToken}>Зарегистрироваться</button>
      </form>
      <p>Есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
};

export default RegisterPage;
