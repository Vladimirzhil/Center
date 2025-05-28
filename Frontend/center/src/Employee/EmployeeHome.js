import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { jwtDecode } from "jwt-decode";

const adminMenuItems = [
  { path: '/applications', name: 'Заявки', roles: ['Employee', 'Admin'] },
  { path: '/brigades', name: 'Бригады', roles: ['Employee', 'Admin'] },
  { path: '/clients', name: 'Клиенты', roles: ['Employee', 'Admin'] },
  { path: '/objects', name: 'Объекты', roles: ['Employee', 'Admin'] },
  { path: '/selectedservices', name: 'Выбранные услуги', roles: ['Employee', 'Admin'] },
  { path: '/services', name: 'Каталог услуг', roles: ['Employee', 'Admin'] },
  { path: '/surveyagreement', name: 'Договоры', roles: ['Employee', 'Admin'] },
  { path: '/surveyreports', name: 'Отчеты', roles: ['Employee', 'Admin'] },
];

const adminOnlyItems = [
  { path: '/employers', name: 'Сотрудники', roles: ['Admin'] },
  { path: '/jobtitles', name: 'Должности', roles: ['Admin'] },
  { path: '/users', name: 'Пользователи', roles: ['Admin'] },
];

export default function EmployeeHome() {
  const { token } = useContext(AuthContext);
  const userRole = token ? jwtDecode(token)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] : null;

  return (
    <div className='profile-card'>
      <div style={{ marginRight:'40px'}}>
        {adminMenuItems
          .filter(item => item.roles.includes(userRole))
          .map((item, index) => (
            <Link 
              key={index}
              to={item.path}
              className="btn btns"
              style={{
                padding: '12px 0',
                textAlign: 'center',
                textDecoration: 'none',
                width: '100%'
              }}
            >
              {item.name}
            </Link>
          ))
        }

        {/* Кнопки только для Admin */}
        {userRole === 'Admin' && 
          adminOnlyItems.map((item, index) => (
            <Link 
              key={`admin-${index}`}
              to={item.path}
              className="btn btns"
              style={{
                padding: '12px 0',
                textAlign: 'center',
                textDecoration: 'none',
                width: '100%'
              }}
            >
              {item.name}
            </Link>
          ))
        }
      </div>
    </div>
  );
}