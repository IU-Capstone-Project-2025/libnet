import {React, useState} from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, update_user } = useAuth();
  const [error, setError] = useState(null);

  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city);

  async function handleUpdate() {
    if (password != '') {
      try {
      await update_user({
       first_name: firstName,
       last_name : lastName,
       email: email,
       password: password,
       phone: phone,
       city: city,
      });
        onClose();
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
      await update_user({
       first_name: firstName,
       last_name : lastName,
       email: email,
       phone: phone,
       city: city,
      });
        onClose();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  return (
    <>
      <label for='user__city'>Выберите город:</label>
      <select className='user__city'>
        <option value="1">Иннополис</option>
        <option value="1">Казань</option>
      </select><br/>

      <label for='user__firstName'>Ваше имя</label>
      <input
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
      /><br/>

      <label for='user__lastName'>Ваша фамилия</label>
      <input
        value={lastName}
        onChange={e => setLastName(e.target.value)}
      /><br/>

      <label for='user__phone'>Номер телефона</label>
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
      /><br/>

      <label for='user__email'>E-mail</label>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br/>

      <label for='user__password'>Пароль</label>
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br/>

      {/* <label for='user__lastName'>Дата род</label>
      <input
        value={lastName}
        onChange={e => setLastName(e.target.value)}
      /> */}

      <button onClick={handleUpdate}>Сохранить</button>
      <button onClick={logout}>Выйти из аккаунта</button>
    </>
  )
}
