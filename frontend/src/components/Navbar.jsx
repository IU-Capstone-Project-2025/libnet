import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPopupWrapper from './AuthPopupWrapper';
import './Navbar.css';

export default function Navbar() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [selected, setSelected] = useState('');

  const handleUserNav = (e) => {
    const path = e.target.value;
    if (path) {
      navigate(path);
      setSelected(''); // Reset select to placeholder
    }
  };

  const toggleBurger = () => {
    setIsBurgerOpen(!isBurgerOpen);
  };

  const closeBurger = () => {
    setIsBurgerOpen(false);
  };

  // Управление блокировкой скролла при открытии модальных окон
  useEffect(() => {
    if (isBurgerOpen || showLogin) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isBurgerOpen, showLogin]);

  return (
    <>
      {user && user.role === 'manager' ? (
        <div className="manager__header">
          <div
            className="user__navbar-logo-container"
            onClick={() => navigate('/manager/')}
          >
            <img
              className="manager__navbar-logo"
              src="/manager-logo-2x.png"
              alt="логотип"
            />
          </div>
          <div className="manager__navbar">
            <Link
              to="/manager/"
              className={`manager__navbar-link ${
                location.pathname === '/manager/' ? 'active' : ''
              }`}
            >
              Каталог
            </Link>
            <Link
              to="/manager/orders"
              className={`manager__navbar-link ${
                location.pathname === '/manager/orders' ? 'active' : ''
              }`}
            >
              Заказы
            </Link>
            <Link
              to="/manager/library"
              className={`manager__navbar-link ${
                location.pathname === '/manager/library' ? 'active' : ''
              }`}
            >
              Библиотека
            </Link>
          </div>
          <select
            value={selected}
            onChange={handleUserNav}
            className="manager__navbar-select"
          >
            <option value="" disabled>
              Пользовательское
            </option>
            <option value="/">Каталог</option>
            <option value="/libraries">Библиотеки</option>
            <option value="/orders">Заказы</option>
            <option value="/favorites">Избранное</option>
          </select>
          <div className="manager__header-account">
            {user ? (
              <span
                className="manager__header-login-button"
                onClick={() => navigate('/profile')}
              >
                {user.displayName}
              </span>
            ) : (
              <span
                className="manager__header-login-button"
                onClick={() => setShowLogin(true)}
              >
                Войти
              </span>
            )}
          </div>

          {/* Burger button for manager */}
          <button
            className="burger-button manager-burger"
            onClick={toggleBurger}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Burger menu for manager */}
          {isBurgerOpen && (
            <div className="burger-overlay" onClick={closeBurger}>
              <div
                className="burger-menu manager-burger-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="burger-content">
                  {user ? (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        navigate('/profile');
                        closeBurger();
                      }}
                    >
                      {user.displayName}
                    </span>
                  ) : (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        setShowLogin(true);
                        closeBurger();
                      }}
                    >
                      Войти
                    </span>
                  )}
                  <div className="burger-divider"></div>
                  <Link
                    to="/manager/"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Каталог
                  </Link>
                  <Link
                    to="/manager/orders"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Заказы
                  </Link>
                  <Link
                    to="/manager/library"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Библиотека
                  </Link>
                  <div className="burger-divider"></div>
                  <div className="burger-user-section">
                    <Link to="/" className="burger-link" onClick={closeBurger}>
                      Каталог (пользователь)
                    </Link>
                    <Link
                      to="/orders"
                      className="burger-link"
                      onClick={closeBurger}
                    >
                      Заказы (пользователь)
                    </Link>
                    <Link
                      to="/favorites"
                      className="burger-link"
                      onClick={closeBurger}
                    >
                      Избранное (пользователь)
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showLogin && (
            <AuthPopupWrapper onClose={() => setShowLogin(false)} />
          )}
        </div>
      ) : user && user.role === 'user' ? (
        <div className="user__header">
          <div
            className="user__navbar-logo-container"
            onClick={() => navigate('/')}
          >
            <img
              className="user__navbar-logo"
              src="/user-logo-2x.png"
              alt="логотип"
            />
          </div>
          <div className="user__navbar">
            <Link
              to="/"
              className={`user__navbar-link ${
                location.pathname === '/' ? 'active' : ''
              }`}
            >
              Каталог
            </Link>
            <Link
              to="/libraries"
              className={`user__navbar-link ${
                location.pathname === '/libraries' ? 'active' : ''
              }`}
            >
              Библиотеки
            </Link>
            <Link
              to="/orders"
              className={`user__navbar-link ${
                location.pathname === '/orders' ? 'active' : ''
              }`}
            >
              Заказы
            </Link>
            <Link
              to="/faq"
              className={`user__navbar-link ${
                location.pathname === '/faq' ? 'active' : ''
              }`}
            >
              FAQ
            </Link>
            <Link
              to="/favorites"
              className={`user__navbar-link ${
                location.pathname === '/favorites' ? 'active' : ''
              }`}
            >
              Избранное
            </Link>
          </div>
          <div className="user__header-account">
            {user ? (
              <span
                className="user__header-login-button"
                onClick={() => navigate('/profile')}
              >
                {user.displayName}
              </span>
            ) : (
              <span
                className="user__header-login-button"
                onClick={() => setShowLogin(true)}
              >
                Войти
              </span>
            )}
          </div>

          {/* Burger button for user */}
          <button className="burger-button user-burger" onClick={toggleBurger}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Burger menu for user */}
          {isBurgerOpen && (
            <div className="burger-overlay" onClick={closeBurger}>
              <div
                className="burger-menu user-burger-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="burger-content">
                  {user ? (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        navigate('/profile');
                        closeBurger();
                      }}
                    >
                      {user.displayName}
                    </span>
                  ) : (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        setShowLogin(true);
                        closeBurger();
                      }}
                    >
                      Войти
                    </span>
                  )}
                  <div className="burger-divider"></div>
                  <Link to="/" className="burger-link" onClick={closeBurger}>
                    Каталог
                  </Link>
                  <Link
                    to="/libraries"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Библиотеки
                  </Link>
                  <Link
                    to="/orders"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Заказы
                  </Link>
                  <Link to="/faq" className="burger-link" onClick={closeBurger}>
                    FAQ
                  </Link>
                  <Link
                    to="/favorites"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Избранное
                  </Link>
                </div>
              </div>
            </div>
          )}

          {showLogin && (
            <AuthPopupWrapper onClose={() => setShowLogin(false)} />
          )}
        </div>
      ) : user && user.role === 'admin' ? (
        <div className="admin__header">
          <div
            className="user__navbar-logo-container"
            onClick={() => navigate('/admin/')}
          >
            <img
              className="admin__navbar-logo"
              src="/admin-logo-2x.png"
              alt="логотип"
            />
          </div>
          <div className="admin__navbar">
            <Link
              to="/admin/"
              className={`user__navbar-link ${
                location.pathname === '/admin/' ? 'active' : ''
              }`}
            >
              Библиотеки
            </Link>
          </div>
          <div className="user__header-account">
            {user ? (
              <span
                className="user__header-login-button"
                onClick={() => navigate('/profile')}
              >
                {user.displayName}
              </span>
            ) : (
              <span
                className="user__header-login-button"
                onClick={() => setShowLogin(true)}
              >
                Войти
              </span>
            )}
          </div>

          {/* Burger button for admin */}
          <button className="burger-button admin-burger" onClick={toggleBurger}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Burger menu for admin */}
          {isBurgerOpen && (
            <div className="burger-overlay" onClick={closeBurger}>
              <div
                className="burger-menu admin-burger-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="burger-content">
                  {user ? (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        navigate('/profile');
                        closeBurger();
                      }}
                    >
                      {user.displayName}
                    </span>
                  ) : (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        setShowLogin(true);
                        closeBurger();
                      }}
                    >
                      Войти
                    </span>
                  )}
                  <div className="burger-divider"></div>
                  <Link
                    to="/admin/"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Библиотеки
                  </Link>
                </div>
              </div>
            </div>
          )}

          {showLogin && (
            <AuthPopupWrapper onClose={() => setShowLogin(false)} />
          )}
        </div>
      ) : (
        <div className="user__header">
          <div
            className="user__navbar-logo-container"
            onClick={() => navigate('/')}
          >
            <img
              className="user__navbar-logo"
              src="/user-logo-2x.png"
              alt="логотип"
            />
          </div>
          <div className="user__navbar">
            <Link
              to="/"
              className={`user__navbar-link ${
                location.pathname === '/' ? 'active' : ''
              }`}
            >
              Каталог
            </Link>
            <Link
              to="/libraries"
              className={`user__navbar-link ${
                location.pathname === '/libraries' ? 'active' : ''
              }`}
            >
              Библиотеки
            </Link>
            <Link
              to="/faq"
              className={`user__navbar-link ${
                location.pathname === '/faq' ? 'active' : ''
              }`}
            >
              FAQ
            </Link>
          </div>
          <div className="user__header-account">
            {user ? (
              <span
                className="user__header-login-button"
                onClick={() => navigate('/profile')}
              >
                {user.displayName}
              </span>
            ) : (
              <span
                className="user__header-login-button"
                onClick={() => setShowLogin(true)}
              >
                Войти
              </span>
            )}
          </div>

          {/* Burger button for user */}
          <button className="burger-button user-burger" onClick={toggleBurger}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Burger menu for user */}
          {isBurgerOpen && (
            <div className="burger-overlay" onClick={closeBurger}>
              <div
                className="burger-menu user-burger-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="burger-content">
                  {user ? (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        navigate('/profile');
                        closeBurger();
                      }}
                    >
                      {user.displayName}
                    </span>
                  ) : (
                    <span
                      className="burger-account-button"
                      onClick={() => {
                        setShowLogin(true);
                        closeBurger();
                      }}
                    >
                      Войти
                    </span>
                  )}
                  <div className="burger-divider"></div>
                  <Link to="/" className="burger-link" onClick={closeBurger}>
                    Каталог
                  </Link>
                  <Link
                    to="/libraries"
                    className="burger-link"
                    onClick={closeBurger}
                  >
                    Библиотеки
                  </Link>
                  <Link to="/faq" className="burger-link" onClick={closeBurger}>
                    FAQ
                  </Link>
                </div>
              </div>
            </div>
          )}

          {showLogin && (
            <AuthPopupWrapper onClose={() => setShowLogin(false)} />
          )}
        </div>
      )}
    </>
  );
}
