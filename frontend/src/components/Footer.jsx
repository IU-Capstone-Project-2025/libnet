import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css"

export default function Footer() {
  const navigate = useNavigate();

  return (
    <div className="user__footer">
      <div className="user__navbar">
        <Link to="/" className="user__navbar-link">Каталог</Link>
        <Link to="/orders" className="user__navbar-link">Заказы</Link>
        <Link to="/faq" className="user__navbar-link">FAQ</Link>
        <Link to="/favorites" className="user__navbar-link">Избранное</Link>
      </div>
      <p>libnet 2025 ©</p>
    </div>
  );
}