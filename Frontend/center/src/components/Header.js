import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';
import logo from "../Image/logo.gif";
import { AuthContext } from '../AuthContext';
import { CgProfile } from "react-icons/cg";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function Header() {
  const { token, logout } = useContext(AuthContext);
  const [clientName, setClientName] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUserRole(role);

        if (role === 'Client') {
          axios.get('https://localhost:44397/api/ClientProfile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(res => {
            setClientName(res.data.fio); 
          })
          .catch(err => {
            console.error('Ошибка при получении данных клиента:', err);
          });
        }
      } catch (err) {
        console.error('Ошибка декодирования токена:', err);
      }
    } else {
      setUserRole(null);
    }
  }, [token]);

   const adminMenuItems = [
    { path: '/menu', name: 'Главная', roles: ['Employee', 'Admin'] },
    { path: '/applications', name: 'Заявки', roles: ['Employee', 'Admin'] },
    { path: '/brigades', name: 'Бригады', roles: ['Employee', 'Admin'] },
    { path: '/clients', name: 'Клиенты', roles: ['Employee', 'Admin'] },
    { path: '/objects', name: 'Объекты', roles: ['Employee', 'Admin'] },
    { path: '/selectedservices', name: 'Выбранные услуги', roles: ['Employee', 'Admin'] },
    { path: '/services', name: 'Каталог услуг', roles: ['Сотрудники', 'Admin'] },
    { path: '/surveyagreement', name: 'Договоры', roles: ['Employee', 'Admin'] },
    { path: '/surveyreports', name: 'Отчеты', roles: ['Employee', 'Admin'] },
  ];

  const adminOnlyItems = [
    { path: '/employers', name: 'Сотрудники', roles: ['Admin'] },
    { path: '/jobtitles', name: 'Должности', roles: ['Admin'] },
    { path: '/users', name: 'Пользователи', roles: ['Admin'] },
  ];

  return (
    <header className='header-container'>
      <div className="header-left">
        <img src={logo} alt="ЦИСКиМ" className="Header-logo" />
        <Navbar collapseOnSelect expand="lg">
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
              {(userRole === 'Client' || !token) && (
                <>
                  <Nav.Link as={Link} to="/" className="headera">Главная</Nav.Link>
                  <Nav.Link as={Link} to="/catalog" className="headera">Каталог услуг</Nav.Link>
                </>
              )}
              
              {token && (userRole === 'Employee' || userRole === 'Admin') ? (
                <>
                  {adminMenuItems
                    .filter(item => item.roles.includes(userRole))
                    .map((item, index) => (
                      <Nav.Link 
                        key={index} 
                        as={Link} 
                        to={item.path} 
                        className="headeremploye"
                      >
                        {item.name}
                      </Nav.Link>
                    ))
                  }
                  {userRole === 'Admin' && 
                    adminOnlyItems.map((item, index) => (
                      <Nav.Link 
                        key={`admin-${index}`} 
                        as={Link} 
                        to={item.path} 
                        className="headeremploye"
                      >
                        {item.name}
                      </Nav.Link>
                    ))
                  }
                </>
              ) : token ? (
                <Nav.Link as={Link} to="/clientobjects" className="headera">Объекты</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/login" className="headera">Авторизироваться</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>

      {token && (
        <div className="header-right">
          {/* Блок профиля только для клиентов */}
          {userRole === 'Client' && clientName && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <CgProfile size={22} />
                <span>{clientName}</span>
              </div>
              <div className="dropdown-menu">
                <Link to="/profile">
                  <button className='profbutton'>Персональные данные</button>
                </Link>
                <button className='exitbutton' onClick={logout}>Выйти</button>
              </div>
            </div>
          )}
          {(userRole === 'Employee' || userRole === 'Admin') && (
            <Link onClick={logout} to="/" className="headera">Выйти</Link>
          )}
        </div>
      )}
    </header>
  );
}