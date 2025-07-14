import React, { useState } from 'react';
import './FAQ.css';

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (itemId) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const faqItems = [
    {
      id: 1,
      question: 'Как забронировать книгу?',
      answer:
        'Чтобы забронировать книгу, необходимо создать аккаунт. Для регистрации нажмите на кнопку "Войти" в верхнем меню, перейдите на страницу регистрации, заполните все поля и нажмите "Зарегистрироваться". После этого вы сможете бронировать книги в каталоге без ограничений.',
    },
    {
      id: 2,
      question: 'Сколько действует бронирование?',
      answer:
        'Каждая библиотека указывает свой срок хранения забронированной книги. Обычно это неделя, но может варьироваться в зависимости от политики конкретной библиотеки. В разделе бронирования вы можете увидеть, до какого числа вы должны забрать книгу.',
    },
    {
      id: 3,
      question: 'Через сколько нужно вернуть книгу?',
      answer:
        'Каждая библиотека указывает свой срок возврата забронированной книги. Обычно это неделя, но может варьироваться в зависимости от политики конкретной библиотеки. В разделе бронирования вы можете увидеть, до какого числа вы должны вернуть книгу.',
    },
    {
      id: 4,
      question: 'Можно ли вводить несуществующие данные при регистрации?',
      answer:
        'Нет. При регистрации необходимо вводить реальные данные, так как они используются для связи с пользователем и его идентификации при выдаче книг. Ввод несуществующих данных может привести к блокировке аккаунта',
    },
    {
      id: 5,
      question: 'Я представитель библиотеки, как стать вашими партнерами?',
      answer:
        'Для регистрации нового учреждения необходимо заполнить форму по ссылке (ссылка). После этого с вами свяжется администратор для миграции базы данных и дальнейшего сотрудничества.',
    },
  ];

  return (
    <>
      <div className="user__faq-content">
        <h1 className="user__heading">FAQ</h1>
        <ul className="user__faq-section">
          {faqItems.map((item) => (
            <li
              key={item.id}
              className="user__faq-item"
              onClick={() => toggleItem(item.id)}
            >
              <div className="user__faq-question-container">
                <h2 className="user__faq-question">{item.question}</h2>
                <svg
                  className={`user__faq-icon ${
                    openItems[item.id] ? 'user__faq-icon--up' : ''
                  }`}
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className={`user__faq-answer-container ${
                  openItems[item.id] ? 'user__faq-answer-container--open' : ''
                }`}
              >
                <p className="user__faq-answer">{item.answer}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
