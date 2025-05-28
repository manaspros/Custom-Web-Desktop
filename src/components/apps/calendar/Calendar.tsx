"use client";

import { useState, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

interface CalendarProps {
  windowId?: string;
}

export default function Calendar({ windowId: _windowId = "default" }: CalendarProps) {
  const { addNotification } = useOS();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<{
    [key: string]: { title: string; time?: string }[];
  }>({});
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  // Load saved events
  useEffect(() => {
    const savedEvents = localStorage.getItem("win11-calendar-events");
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Failed to parse calendar events", e);
      }
    }
  }, []);

  // Save events when they change
  useEffect(() => {
    if (Object.keys(events).length > 0) {
      localStorage.setItem("win11-calendar-events", JSON.stringify(events));
    }
  }, [events]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Get days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: startDay }, (_, i) => ({
      day: prevMonthLastDay - startDay + i + 1,
      currentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - startDay + i + 1),
    }));

    // Current month days
    const currentMonthDays = Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      date: new Date(year, month, i + 1),
    }));

    // Next month days to complete the calendar (6 rows x 7 days = 42 cells total)
    const totalCells = 42;
    const remainingCells =
      totalCells - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => ({
      day: i + 1,
      currentMonth: false,
      date: new Date(year, month + 1, i + 1),
    }));

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Format date as a string key for events
  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle day click
  const handleDayClick = (day: {
    day: number;
    currentMonth: boolean;
    date: Date;
  }) => {
    setSelectedDate(day.date);
  };

  // Add new event
  const addEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return;

    const dateKey = formatDateKey(selectedDate);
    const newEvent = {
      title: newEventTitle,
      time: newEventTime || undefined,
    };

    setEvents((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent],
    }));

    setNewEventTitle("");
    setNewEventTime("");
    setShowAddEvent(false);

    addNotification({
      title: "Calendar",
      message: `Added event: ${newEventTitle}`,
      type: "success",
    });
  };

  // Delete event
  const deleteEvent = (dateKey: string, index: number) => {
    setEvents((prev) => {
      const updatedEvents = { ...prev };
      updatedEvents[dateKey] = updatedEvents[dateKey].filter(
        (_, i) => i !== index
      );

      if (updatedEvents[dateKey].length === 0) {
        delete updatedEvents[dateKey];
      }

      return updatedEvents;
    });

    addNotification({
      title: "Calendar",
      message: "Event deleted",
      type: "info",
    });
  };

  // Calendar days array
  const calendarDays = generateCalendarDays();

  // Get events for selected date
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : "";
  const selectedDateEvents = selectedDateKey
    ? events[selectedDateKey] || []
    : [];

  // Get current month name and year
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <div className="calendar-app">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={goToPrevMonth}>◀</button>
          <h2>
            {monthName} {year}
          </h2>
          <button onClick={goToNextMonth}>▶</button>
        </div>
        <button className="today-button" onClick={goToToday}>
          Today
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day of week headers */}
        <div className="calendar-weekday">Sun</div>
        <div className="calendar-weekday">Mon</div>
        <div className="calendar-weekday">Tue</div>
        <div className="calendar-weekday">Wed</div>
        <div className="calendar-weekday">Thu</div>
        <div className="calendar-weekday">Fri</div>
        <div className="calendar-weekday">Sat</div>

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const dateKey = formatDateKey(day.date);
          const hasEvents = events[dateKey] && events[dateKey].length > 0;
          const isToday = new Date().toDateString() === day.date.toDateString();
          const isSelected =
            selectedDate &&
            selectedDate.toDateString() === day.date.toDateString();

          return (
            <div
              key={index}
              className={`calendar-day ${
                day.currentMonth ? "current-month" : "other-month"
              } ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-number">{day.day}</div>
              {hasEvents && <div className="event-indicator"></div>}
            </div>
          );
        })}
      </div>

      <div className="calendar-detail">
        {selectedDate && (
          <div className="selected-date-info">
            <h3>
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            {/* Event list */}
            <div className="events-list">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event, index) => (
                  <div key={index} className="event-item">
                    <div className="event-content">
                      <div className="event-title">{event.title}</div>
                      {event.time && (
                        <div className="event-time">{event.time}</div>
                      )}
                    </div>
                    <button
                      className="delete-event"
                      onClick={() => deleteEvent(selectedDateKey, index)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-events">No events for this day</div>
              )}
            </div>

            {/* Add event button/form */}
            {!showAddEvent ? (
              <button
                className="add-event-button"
                onClick={() => setShowAddEvent(true)}
              >
                + Add Event
              </button>
            ) : (
              <div className="add-event-form">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                />
                <div className="form-actions">
                  <button
                    className="add-button"
                    onClick={addEvent}
                    disabled={!newEventTitle.trim()}
                  >
                    Add
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setShowAddEvent(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .calendar-app {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .calendar-controls h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }

        .calendar-controls button {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 4px;
        }

        .calendar-controls button:hover {
          background-color: var(--hover-bg);
        }

        .today-button {
          padding: 6px 12px;
          background-color: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: auto repeat(6, 1fr);
          padding: 10px;
          flex: 1;
          min-height: 0;
          overflow: auto;
        }

        .calendar-weekday {
          text-align: center;
          font-weight: 500;
          padding: 10px;
          font-size: 14px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .calendar-day {
          padding: 5px;
          text-align: center;
          cursor: pointer;
          position: relative;
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid transparent;
        }

        .calendar-day:hover {
          background-color: var(--hover-bg);
        }

        .day-number {
          font-size: 14px;
          margin-bottom: 5px;
        }

        .other-month {
          color: var(--text-muted);
        }

        .today {
          font-weight: bold;
          color: var(--accent-color);
        }

        .selected {
          border: 2px solid var(--accent-color);
          border-radius: 4px;
        }

        .event-indicator {
          width: 6px;
          height: 6px;
          background-color: var(--accent-color);
          border-radius: 50%;
          margin-top: 2px;
        }

        .calendar-detail {
          border-top: 1px solid var(--border-color);
          padding: 15px;
          height: 200px;
          overflow-y: auto;
        }

        .selected-date-info h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 500;
        }

        .events-list {
          margin-bottom: 15px;
        }

        .event-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .event-content {
          flex: 1;
        }

        .event-title {
          font-weight: 500;
        }

        .event-time {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .delete-event {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .delete-event:hover {
          background-color: var(--hover-bg);
          color: var(--text-color);
        }

        .no-events {
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          padding: 10px;
        }

        .add-event-button {
          width: 100%;
          padding: 8px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          text-align: left;
        }

        .add-event-button:hover {
          background-color: var(--hover-bg);
        }

        .add-event-form {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .add-event-form input {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--input-bg);
          color: var(--text-color);
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .form-actions button {
          flex: 1;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          cursor: pointer;
        }

        .add-button {
          background-color: var(--accent-color);
          color: white;
          border-color: var(--accent-color) !important;
        }

        .add-button:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .cancel-button {
          background-color: var(--bg-secondary);
        }

        :global([data-theme="dark"]) .calendar-app {
          --bg-secondary: #333;
          --border-color: rgba(255, 255, 255, 0.1);
          --hover-bg: rgba(255, 255, 255, 0.05);
          --text-secondary: #aaa;
          --text-muted: #777;
          --accent-color: #0078d4;
          --input-bg: #444;
        }

        :global([data-theme="light"]) .calendar-app {
          --bg-secondary: #f5f5f5;
          --border-color: rgba(0, 0, 0, 0.1);
          --hover-bg: rgba(0, 0, 0, 0.03);
          --text-secondary: #666;
          --text-muted: #999;
          --accent-color: #0078d4;
          --input-bg: white;
        }
      `}</style>
    </div>
  );
}
