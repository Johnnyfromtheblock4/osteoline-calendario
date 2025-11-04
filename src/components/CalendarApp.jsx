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
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState({ hours: "00", minutes: "00" });
  const [eventText, setEventText] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

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

  // funzione per selezionare il giorno dell'evento
  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();

    if (clickedDate >= today || isSameDay(clickedDate, today)) {
      setSelectedDate(clickedDate);
      setShowEventPopup(true);
      setEventTime({ hours: "00", minutes: "00" });
      setEventText("");
      setEditingEvent(null);
    }
  };

  // funzione per chiamare evento per il giorno corrente
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // funzione per aggiungere evento (padStart aggiunge un elemento all'oggetto con 2 parametri e se è uno solo ci aggiunge davanti lo 0)
  const handleEventSubmit = () => {
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: `${eventTime.hours.padStart(2, "0")}:${eventTime.hours.padStart(
        2,
        "0"
      )}`,
      text: eventText,
    };

    // variabile che crea copia dell'evento per la modifica
    let updatedEvents = [...events];

    if (editingEvent) {
      updatedEvents = updatedEvents.map((event) =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents.push(newEvent);
    }

    updatedEvents.sort((a, b) => newDate(a.date) - new Date(b.date));

    // crea un nuovo array composto da events e newEvent
    setEvents(updatedEvents);
    setEventTime({ hours: "00", minutes: "00" });
    setEventText("");
    setShowEventPopup(false); // per chiudere l'evento quando inserito
    setEditingEvent(null);
  };

  // funzione per l'editing
  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    setEventTime({
      hours: event.time.split(":")[0],
      minutes: event.time.split(":")[1],
    });
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
  };

  // funzione per eliminare vento
  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);

    setEvents(updatedEvents);
  };

  // funzione per cambio di orari
  const handleTimeChange = (e) => {
    const [name, value] = e.target;

    setEventTime((prevTime) => ({
      ...prevTime,
      [name]: value.padStart(2, "0"),
    }));
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
              <span
                key={day + 1}
                className={
                  day + 1 === currentDate.getDate() &&
                  currentMonth === currentDate.getMonth() &&
                  currentYear === currentDate.getFullYear()
                    ? "current-day"
                    : ""
                }
                onClick={() => handleDayClick(day + 1)}
              >
                {day + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="events">
          {showEventPopup && (
            <div className="event-popup">
              <div className="time-input">
                <div className="event-popup-time">ORA</div>
                <input
                  type="number"
                  name="hours"
                  min={0}
                  max={24}
                  className="hours"
                  value={eventTime.hours}
                  onChange={handleTimeChange}
                />
                <input
                  type="number"
                  name="minutes"
                  min={0}
                  max={60}
                  className="minutes"
                  value={eventTime.minutes}
                  onChange={handleTimeChange}
                />
              </div>
              <textarea
                placeholder="Descrizione Evento (Max 60 caratteri)"
                value={eventText}
                onChange={(e) => {
                  if (e.target.value.length <= 60) {
                    setEventText(e.target.value);
                  }
                }}
              ></textarea>
              <button className="event-popup-btn" onClick={handleEventSubmit}>
                {editingEvent ? "Aggiorna Evento" : "Aggiungi Evento"}
              </button>
              <button
                className="close-event-popup"
                onClick={() => setShowEventPopup(false)}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
          )}
          {events.map((event, index) => (
            <div className="event" key={index}>
              <div className="event-date-wrapper">
                <div className="event-date">{`${event.date.getDate()} ${
                  monthsOfYear[event.date.getMonth()]
                } ${event.date.getFullYear()}`}</div>
                <div className="event-time">{event.time}</div>
              </div>
              <div className="event-text">{event.text}</div>
              <div className="event-buttons">
                <i
                  className="bx bxs-edit-alt"
                  onClick={() => handleEditEvent(event)}
                ></i>
                <i
                  class="fa-solid fa-square-xmark"
                  onClick={() => handleDeleteEvent(event.id)}
                ></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CalendarApp;
