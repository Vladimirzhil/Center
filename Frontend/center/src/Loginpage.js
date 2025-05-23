import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { parseJwt } from './utils/Jwt';

const Loginpage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('https://localhost:44397/api/Auth/login', { email, password });
      const token = res.data.token;

      const payload = parseJwt(token);
      login(token);

      if (payload?.role === 'Employee' || payload?.role === 'Admin') {
        navigate('/menu');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе');
    }
  };

  return (
    <div>
      <h2>Авторизация</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
      <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      <p>Забыли пароль? <Link to="/resetpassword">Сбросьте</Link></p>
    </div>
  );
};

export default Loginpage;
