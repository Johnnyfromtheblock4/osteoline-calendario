import { useState, useEffect } from "react";

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
  const [eventRoom, setEventRoom] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  // ✅ Mostra automaticamente gli appuntamenti del giorno corrente al primo caricamento
  useEffect(() => {
    setSelectedDate(currentDate);
    setShowDayDetails(true);
  }, []);

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

  // funzione per calcolo del mese successivo
  const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) =>
      currentMonth === 11 ? prevYear + 1 : prevYear
    );
  };

  // funzione per confrontare due date (senza orario)
  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

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
  const showCustomAlert = (message) => setAlertMessage(message);

  // funzione per aggiungere evento
  const handleEventSubmit = () => {
    // se non è tutto il giorno e non è stata selezionata una stanza
    if (!isAllDay && !eventRoom) {
      showCustomAlert("Seleziona una stanza prima di salvare l'evento.");
      return;
    }

    // controllo validità orario di fine > orario di inizio
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

    // controllo sovrapposizione di orari nella stessa stanza
    if (!isAllDay && eventRoom) {
      const overlapping = events.some((e) => {
        if (
          e.room === eventRoom &&
          isSameDay(e.date, selectedDate) &&
          e.id !== (editingEvent?.id || null)
        ) {
          if (e.isAllDay) return true;

          const [start, end] = e.time.split(" - ");
          const [startH, startM] = start.split(":").map(Number);
          const [endH, endM] = end.split(":").map(Number);

          const startMinutesExisting = startH * 60 + startM;
          const endMinutesExisting = endH * 60 + endM;

          const startMinutesNew =
            parseInt(eventStartTime.hours) * 60 +
            parseInt(eventStartTime.minutes);
          const endMinutesNew =
            parseInt(eventEndTime.hours) * 60 + parseInt(eventEndTime.minutes);

          // verifica se gli orari si sovrappongono
          return (
            startMinutesNew < endMinutesExisting &&
            endMinutesNew > startMinutesExisting
          );
        }
        return false;
      });

      if (overlapping) {
        showCustomAlert("Stanza già prenotata");
        return;
      }
    }

    // controllo eventi "tutto il giorno" duplicati
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

    // creazione nuovo evento
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
      room: eventRoom,
      isAllDay,
    };

    // aggiorna lista eventi
    let updatedEvents = [...events];
    if (editingEvent) {
      updatedEvents = updatedEvents.map((event) =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents.push(newEvent);
    }

    updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // reset stati e chiudi popup
    setEvents(updatedEvents);
    setEventStartTime({ hours: "00", minutes: "00" });
    setEventEndTime({ hours: "00", minutes: "00" });
    setEventText("");
    setEventRoom("");
    setIsAllDay(false);
    setShowEventPopup(false);
    setEditingEvent(null);
  };

  // funzione per edit evento
  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
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
  const handleDeleteEvent = (eventId) =>
    setEvents(events.filter((event) => event.id !== eventId));

  // eventi del giorno selezionato
  const eventsForSelectedDay = events.filter((event) =>
    selectedDate ? isSameDay(new Date(event.date), selectedDate) : false
  );

  // ordina eventi per stanza e ora
  const rooms = ["Stanza Fede", "Stanza trattamenti", "Palestra"];
  const getRoomColor = (room) => {
    switch (room) {
      case "Stanza Fede":
        return "#00a3ff";
      case "Stanza trattamenti":
        return "#992BFF";
      case "Palestra":
        return "#0BA84A";
      default:
        return "#555";
    }
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
                className={`${
                  day + 1 === currentDate.getDate() &&
                  currentMonth === currentDate.getMonth() &&
                  currentYear === currentDate.getFullYear()
                    ? "current-day"
                    : ""
                } ${
                  selectedDate &&
                  isSameDay(
                    new Date(currentYear, currentMonth, day + 1),
                    selectedDate
                  )
                    ? "selected-day"
                    : ""
                }`}
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

              {rooms.map((room) => {
                const roomEvents = eventsForSelectedDay
                  .filter((e) => e.room === room)
                  .sort((a, b) => (a.time > b.time ? 1 : -1));

                return (
                  <div key={room} className="room-section">
                    <h3
                      className="room-title"
                      style={{ color: getRoomColor(room) }}
                    >
                      {room}:
                    </h3>

                    {roomEvents.length > 0 ? (
                      roomEvents.map((event) => (
                        <div
                          className={`event ${
                            event.room === "Stanza Fede"
                              ? "fede"
                              : event.room === "Stanza trattamenti"
                              ? "trattamenti"
                              : event.room === "Palestra"
                              ? "palestra"
                              : ""
                          }`}
                          key={event.id}
                        >
                          <div className="event-date-wrapper">
                            <div className="event-time">
                              {event.isAllDay ? "Tutto il giorno" : event.time}
                            </div>
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
                  </div>
                );
              })}

              <button
                className="event-popup-btn"
                onClick={() => setShowEventPopup(true)}
              >
                Aggiungi Evento
              </button>
            </div>
          )}

          {/* Popup evento */}
          {showEventPopup && (
            <div className="event-popup">
              {/* Input ora inizio */}
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

              {/* Input ora fine */}
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
                      if (checked) setEventRoom("");
                    }}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="all-day-label">Tutto il giorno</span>
              </div>

              {/* Dropdown stanza */}
              {!isAllDay && (
                <select
                  className="event-room-dropdown"
                  value={eventRoom}
                  onChange={(e) => setEventRoom(e.target.value)}
                >
                  <option value="">Scegli stanza</option>
                  <option value="Stanza Fede">Stanza Fede</option>
                  <option value="Stanza trattamenti">Stanza trattamenti</option>
                  <option value="Palestra">Palestra</option>
                </select>
              )}

              <textarea
                placeholder="Descrizione Evento (Max 60 caratteri)"
                value={eventText}
                onChange={(e) => {
                  if (e.target.value.length <= 60) setEventText(e.target.value);
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
