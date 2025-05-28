import React from 'react';
import Slider from './components/Slider';

export default function Home() {
  return (
    <div>
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">
          Центр исследований строительных конструкций и материалов
        </h1>
        <p className="hero-subtitle">
          С 2006 года мы обеспечиваем надёжность, безопасность и экспертную поддержку объектов по всей России
        </p>
      </section>
  </div>
      <section className="slider-section">
        <Slider />
    </section>
      <div className="home-container"> 
      <section className="contact-section contact-inverse">
        <h2 className="section-title">О компании</h2>
        <p className="contact-text">
          Центр был основан в 2006 году и изначально занимался обследованием технического состояния зданий и строительной лабораторией.
        </p>
        <p className="contact-text">
          Сегодня мы — ведущая организация региона в области научно-технического сопровождения строительства и недвижимости.
        </p>
      </section>
      <div className="experience-services-wrapper">
        <section className="experience-section">
          <h2 className="section-title">Наш опыт</h2>
          <p className="section-text">
            Более 2000 выполненных объектов в различных регионах РФ: Москва, Ленинградская область, Рязань, Астрахань, Воронеж и др.
          </p>
          <p className="section-text">
            Собственная аккредитованная строительная лаборатория оснащена современным оборудованием.
          </p>
        </section>

        <section className="services-section">
          <h2 className="section-title">Наши направления</h2>
          <ul className="services-grid">
            <li>Обследование зданий и сооружений</li>
            <li>Объекты культурного наследия</li>
            <li>Лабораторные испытания материалов</li>
            <li>Неразрушающий контроль</li>
            <li>Строительный контроль</li>
            <li>Судебная экспертиза</li>
            <li>Землеустроительная экспертиза</li>
            <li>Оценочная экспертиза</li>
            <li>Геодезия и кадастр</li>
            <li>Сертификация материалов</li>
            <li>Проектные работы</li>
          </ul>
        </section>
      </div>

      <section className="contact-section contact-inverse">
        <h2 className="section-title" style={{ color: 'white' }}>Готовы начать?</h2>
        <p className="contact-text">Свяжитесь с нами и получите профессиональную консультацию уже сегодня.</p>
        <p>+7 (4912) 24-02-85, 95-03-39</p>
      </section>
    </div>
  </div>
  );
}
