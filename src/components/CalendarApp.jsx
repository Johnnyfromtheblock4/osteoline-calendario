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
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [events, setEvents] = useState([]);

  // stati per orari di inizio e fine
  const [eventStartTime, setEventStartTime] = useState({
    hours: "00",
    minutes: "00",
  });
  const [eventEndTime, setEventEndTime] = useState({
    hours: "00",
    minutes: "00",
  });

  const [eventText, setEventText] = useState("");
  const [eventRoom, setEventRoom] = useState(""); // variabile per la stanza
  const [isAllDay, setIsAllDay] = useState(false); // stato per switch "Tutto il giorno"
  const [editingEvent, setEditingEvent] = useState(null);
  const [alertMessage, setAlertMessage] = useState(""); // stato per popup

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

  // funzione per chiamare evento per il giorno corrente
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // funzione per selezionare il giorno dell'evento
  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();

    if (clickedDate >= today || isSameDay(clickedDate, today)) {
      setSelectedDate(clickedDate);
      setShowDayDetails(true);
      setShowEventPopup(false);
    }
  };

  // funzione per mostrare il popup personalizzato
  const showCustomAlert = (message) => {
    setAlertMessage(message);
  };

  // funzione per aggiungere evento (padStart aggiunge un elemento all'oggetto con 2 parametri e se è uno solo ci aggiunge davanti lo 0)
  const handleEventSubmit = () => {
    // Se NON è "tutto il giorno", la stanza è obbligatoria
    if (!isAllDay && !eventRoom) {
      showCustomAlert("Seleziona una stanza prima di salvare l'evento.");
      return;
    }

    // Validazione: ora fine deve essere dopo ora inizio
    if (
      !isAllDay &&
      (parseInt(eventEndTime.hours) < parseInt(eventStartTime.hours) ||
        (parseInt(eventEndTime.hours) === parseInt(eventStartTime.hours) &&
          parseInt(eventEndTime.minutes) <= parseInt(eventStartTime.minutes)))
    ) {
      showCustomAlert(
        "L'orario di fine deve essere successivo a quello di inizio."
      );
      return;
    }

    // se è tutto il giorno, impedisci di creare più eventi nello stesso giorno
    if (
      isAllDay &&
      events.some(
        (e) =>
          isSameDay(e.date, selectedDate) &&
          e.isAllDay &&
          e.id !== (editingEvent?.id || null)
      )
    ) {
      showCustomAlert(
        "Non puoi creare un evento in questo giorno (Esiste già un appuntamento tutto il giorno)."
      );
      return;
    }

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: isAllDay
        ? "Tutto il giorno"
        : `${eventStartTime.hours.padStart(
            2,
            "0"
          )}:${eventStartTime.minutes.padStart(
            2,
            "0"
          )} - ${eventEndTime.hours.padStart(
            2,
            "0"
          )}:${eventEndTime.minutes.padStart(2, "0")}`,
      text: eventText,
      room: eventRoom, // aggiunto campo stanza
      isAllDay, // nuova proprietà
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

    updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // crea un nuovo array composto da events e newEvent
    setEvents(updatedEvents);
    setEventStartTime({ hours: "00", minutes: "00" });
    setEventEndTime({ hours: "00", minutes: "00" });
    setEventText("");
    setEventRoom("");
    setIsAllDay(false);
    setShowEventPopup(false); // per chiudere l'evento quando inserito
    setEditingEvent(null);
  };

  // funzione per l'editing
  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));

    // estrai orari di inizio/fine se esistono
    if (event.time.includes(" - ")) {
      const [start, end] = event.time.split(" - ");
      setEventStartTime({
        hours: start.split(":")[0],
        minutes: start.split(":")[1],
      });
      setEventEndTime({
        hours: end.split(":")[0],
        minutes: end.split(":")[1],
      });
    } else {
      setEventStartTime({ hours: "00", minutes: "00" });
      setEventEndTime({ hours: "00", minutes: "00" });
    }

    setEventText(event.text);
    setEventRoom(event.room || "");
    setIsAllDay(event.isAllDay || false);
    setEditingEvent(event);
    setShowEventPopup(true);
  };

  // funzione per eliminare evento
  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);
  };

  // filtra eventi per giorno selezionato
  const eventsForSelectedDay = events.filter((event) =>
    selectedDate ? isSameDay(new Date(event.date), selectedDate) : false
  );

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
                className={`
                  ${
                    day + 1 === currentDate.getDate() &&
                    currentMonth === currentDate.getMonth() &&
                    currentYear === currentDate.getFullYear()
                      ? "current-day"
                      : ""
                  }
                  ${
                    selectedDate &&
                    isSameDay(
                      new Date(currentYear, currentMonth, day + 1),
                      selectedDate
                    )
                      ? "selected-day"
                      : ""
                  }
                `}
                onClick={() => handleDayClick(day + 1)}
              >
                {day + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="events">
          {/* Dettaglio del giorno selezionato */}
          {showDayDetails && selectedDate && (
            <div className="day-details">
              <h2 className="selected-day-title">
                {`${selectedDate.getDate()} ${
                  monthsOfYear[selectedDate.getMonth()]
                } ${selectedDate.getFullYear()}`}
              </h2>
              {eventsForSelectedDay.length > 0 ? (
                eventsForSelectedDay.map((event) => (
                  <div className="event" key={event.id}>
                    <div className="event-date-wrapper">
                      <div className="event-time">
                        {event.isAllDay ? "Tutto il giorno" : event.time}
                      </div>
                      {event.room && (
                        <div className="event-room">{event.room}</div>
                      )}
                    </div>
                    <div className="event-text">{event.text}</div>
                    <div className="event-buttons">
                      <i
                        className="bx bxs-edit-alt"
                        onClick={() => handleEditEvent(event)}
                      ></i>
                      <i
                        className="fa-solid fa-square-xmark"
                        onClick={() => handleDeleteEvent(event.id)}
                      ></i>
                    </div>
                  </div>
                ))
              ) : (
                <p className="default-message">
                  Nessun evento per questo giorno.
                </p>
              )}
              <button
                className="event-popup-btn"
                onClick={() => {
                  const hasAllDayEvent = eventsForSelectedDay.some(
                    (e) => e.isAllDay
                  );

                  if (hasAllDayEvent) {
                    showCustomAlert(
                      "Non puoi creare un evento in questo giorno (Esiste già un appuntamento tutto il giorno)."
                    );
                    return;
                  }

                  setShowEventPopup(true);
                  setEditingEvent(null);
                  setEventStartTime({ hours: "00", minutes: "00" });
                  setEventEndTime({ hours: "00", minutes: "00" });
                  setEventText("");
                  setEventRoom("");
                  setIsAllDay(false);
                }}
              >
                Aggiungi Evento
              </button>
            </div>
          )}

          {/* Popup per aggiungere/modificare evento */}
          {showEventPopup && (
            <div className="event-popup">
              {/* Input ORA INIZIO */}
              <div className="time-input">
                <div className="event-popup-time">DA</div>
                <input
                  type="number"
                  min={0}
                  max={24}
                  className="hours"
                  value={eventStartTime.hours}
                  onChange={(e) =>
                    setEventStartTime((prev) => ({
                      ...prev,
                      hours: e.target.value.padStart(2, "0"),
                    }))
                  }
                  disabled={isAllDay}
                />
                <input
                  type="number"
                  min={0}
                  max={60}
                  className="minutes"
                  value={eventStartTime.minutes}
                  onChange={(e) =>
                    setEventStartTime((prev) => ({
                      ...prev,
                      minutes: e.target.value.padStart(2, "0"),
                    }))
                  }
                  disabled={isAllDay}
                />
              </div>

              {/* Input ORA FINE */}
              <div className="time-input">
                <div className="event-popup-time">A</div>
                <input
                  type="number"
                  min={0}
                  max={24}
                  className="hours"
                  value={eventEndTime.hours}
                  onChange={(e) =>
                    setEventEndTime((prev) => ({
                      ...prev,
                      hours: e.target.value.padStart(2, "0"),
                    }))
                  }
                  disabled={isAllDay}
                />
                <input
                  type="number"
                  min={0}
                  max={60}
                  className="minutes"
                  value={eventEndTime.minutes}
                  onChange={(e) =>
                    setEventEndTime((prev) => ({
                      ...prev,
                      minutes: e.target.value.padStart(2, "0"),
                    }))
                  }
                  disabled={isAllDay}
                />
              </div>

              {/* Switch "Tutto il giorno" */}
              <div className="all-day-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsAllDay(checked);
                      if (checked) setEventRoom(""); // resetta stanza se tutto il giorno
                    }}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="all-day-label">Tutto il giorno</span>
              </div>

              {/* Dropdown per la stanza */}
              {!isAllDay && (
                <select
                  className="event-room-dropdown"
                  value={eventRoom}
                  onChange={(e) => setEventRoom(e.target.value)}
                >
                  <option value="">Scegli stanza</option>
                  <option value="Stanza trattamenti">Stanza trattamenti</option>
                  <option value="Stanza Fede">Stanza Fede</option>
                  <option value="Palestra">Palestra</option>
                </select>
              )}

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
        </div>

        {/* Popup personalizzato */}
        {alertMessage && (
          <div className="custom-alert-overlay">
            <div className="custom-alert">
              <p>{alertMessage}</p>
              <button
                className="custom-alert-close"
                onClick={() => setAlertMessage("")}
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarApp;
