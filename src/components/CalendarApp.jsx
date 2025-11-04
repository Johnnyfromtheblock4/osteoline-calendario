import { useState } from "react";

const CalendarApp = () => {
  const daysOfWeek = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const monthsOfYear = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  const currentDate = new Date();

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  // funzione che determina il numero di giorni in un mese
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // funzione che determina il primo giorno del mese e restituisce in giorno della settimana
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // variabile che corregge per iniziare da Lun (calendario americano)
  const firstDayIndex = (firstDayOfMonth + 6) % 7;

  // funzione per calcolo del mese precedente
  const prevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear((prevYear) =>
      currentMonth === 0 ? prevYear - 1 : prevYear
    );
  };

  // funzione per calcolo del mese succesivo
  const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) =>
      currentMonth === 11 ? prevYear + 1 : prevYear
    );
  };

  return (
    <>
      <div className="calendar-app">
        <div className="calendar">
          <h1 className="heading">OSTEOLINE</h1>
          <div className="navigate-date">
            <h2 className="month">{monthsOfYear[currentMonth]}</h2>
            <h2 className="year">{currentYear}</h2>
            <div className="buttons">
              <i className="bx bx-chevron-left" onClick={prevMonth}></i>
              <i className="bx bx-chevron-right" onClick={nextMonth}></i>
            </div>
          </div>
          <div className="weekdays">
            {daysOfWeek.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="days">
            {[...Array(firstDayIndex).keys()].map((_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {[...Array(daysInMonth).keys()].map((day) => (
              <span key={day + 1}>{day + 1}</span>
            ))}
          </div>
        </div>
        <div className="events">
          <div className="event-popup">
            <div className="time-input">
              <div className="event-popup-time">ORA</div>
              <input
                type="number"
                name="hours"
                min={0}
                max={24}
                className="hours"
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={60}
                className="minutes"
              />
            </div>
            <textarea placeholder="Descrizione Evento (Max 60 caratteri)"></textarea>
            <button className="event-popup-btn">Inserisci Evento</button>
            <button className="close-event-popup">
              <i className="bx bx-x"></i>
            </button>
          </div>
          <div className="event">
            <div className="event-date-wrapper">
              <div className="event-date">14 Novembre, 2025</div>
              <div className="event-time">10:00</div>
            </div>
            <div className="event-text">Appuntamento Visconti</div>
            <div className="event-buttons">
              <i className="bx bxs-edit-alt"></i>
              <i className="bx bxs-message-alt-x"></i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarApp;
