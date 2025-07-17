import { useState, useEffect } from 'react';
import LoginPopup from './LoginPopup';
import RegisterPopup from './RegisterPopup';

export default function AuthPopupWrapper({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);

  const handleSwitch = () => {
    setIsRegister((prev) => !prev);
  };

  useEffect(() => {
    document.body.classList.add('modal-open');

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return isRegister ? (
    <RegisterPopup onClose={onClose} switchToLogin={handleSwitch} />
  ) : (
    <LoginPopup onClose={onClose} switchToRegister={handleSwitch} />
  );
}
