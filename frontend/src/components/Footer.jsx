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
          <p className="copyright">libnet 2025 ©</p>
        </div>
      ) : user && user.role === 'user' ? (
        <div className="user__footer">
          <p className="copyright">libnet 2025 ©</p>
        </div>
      ) : user && user.role === 'admin' ?(
        <div className="admin__footer">
          <p className="copyright">libnet 2025 ©</p>
        </div>
      ) : (
        <div className="user__footer">
          <p className="copyright">libnet 2025 ©</p>
        </div>
      )}
    </>

    
  );
}