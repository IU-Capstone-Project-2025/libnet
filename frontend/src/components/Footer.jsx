import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./Navbar.css"

export default function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {user && user.role === 'manager' ? (
        <div className="manager__footer">
          <div className="manager__navbar manager__footer-navbar">
            <Link to="/manager/" className="manager__navbar-link">
              Каталог
            </Link>
            <Link to="/manager/orders" className="manager__navbar-link">
              Заказы
            </Link>
            <Link to="/manager/library" className="manager__navbar-link">
              Библиотека
            </Link>
          </div>
          <p className="copyright">libnet 2025 ©</p>
        </div>
      ) : !user || user.role === 'user' ? (
        <div className="user__footer">
          <div className="user__navbar user__footer-navbar">
            <Link to="/" className="user__navbar-link">Каталог</Link>
            <Link to="/orders" className="user__navbar-link">Заказы</Link>
            <Link to="/faq" className="user__navbar-link">FAQ</Link>
            <Link to="/favorites" className="user__navbar-link">Избранное</Link>
          </div>
          <p className="copyright">libnet 2025 ©</p>
        </div>
      ): (
        <></>
      )}
    </>

    
  );
}