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

  useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

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
  }
}, [token]);


  return (
    <header className='header-container'>
      <img src={logo} alt="ЦИСКиМ" className="Header-logo" />
      <Navbar collapseOnSelect expand="lg">
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav>
            <Nav.Link><Link to='/'>Главная</Link></Nav.Link>

            {!token && (
              <Nav.Link><Link to='/login'>Авторизироваться</Link></Nav.Link>
            )}

            {token && (
              <Nav.Link><Link to='/objects'>Объекты</Link></Nav.Link>
            )}

            {token && clientName && (
              <Nav.Link as={Link} to='/profile'>
                <CgProfile style={{ marginRight: '5px' }} />
                {clientName}
              </Nav.Link>
            )}

            {token && (
              <Nav.Link onClick={logout}><Link to='/' className='exit'>Выйти</Link></Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
}
