import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Loginpage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('https://localhost:44397/api/Auth/login', { email, password });
      const token = res.data.token;
      
      // Декодируем токен так же, как в Header
      const decoded = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      
      login(token);

      // Перенаправляем согласно роли, как в Header
      if (role === 'Employee' || role === 'Admin') {
        navigate('/menu');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе');
    }
  };

  return (
    <div className="profile-card">
      <h2 className="profile-title">Авторизация</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>
        <div className="button-center">
          <button style={{marginTop: '-20px', marginBottom:'20px'}} className="btns">Войти</button>
        </div>
      </form>
      <p style={{ fontSize: '20px' }}>
        Нет аккаунта? <Link className="links" to="/register">Зарегистрироваться</Link>
      </p>
      <p style={{ fontSize: '20px' }}>
        Забыли пароль? <Link className="links" to="/resetpassword">Сбросьте</Link>
      </p>
    </div>
  );
};

export default Loginpage;