"use client";

import { useState, useEffect } from "react";

interface CalendarProps {
  isWidget?: boolean;
}

export default function Calendar({ isWidget = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<
    {
      id: string;
      title: string;
      date: Date;
      time?: string;
      isCompleted?: boolean;
    }[]
  >([]);

  // Mock events
  useEffect(() => {
    const mockEvents = [
      {
        id: "1",
        title: "Team Meeting",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        time: "10:00 AM",
      },
      {
        id: "2",
        title: "Doctor Appointment",
        date: new Date(new Date().setDate(new Date().getDate() + 4)),
        time: "2:30 PM",
      },
      {
        id: "3",
        title: "Submit Report",
        date: new Date(),
        time: "5:00 PM",
        isCompleted: false,
      },
    ];
    setEvents(mockEvents);
  }, []);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create an array of day objects
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Add empty cells to complete the last week if needed
    const remainingCells = 42 - days.length; // 6 rows * 7 days = 42 cells
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: 0, isCurrentMonth: false });
    }

    return days;
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Check if a date has events
  const getEventsForDate = (day: number) => {
    if (day === 0) return [];

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  // Check if a day is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if a day is selected
  const isSelected = (day: number): boolean => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Handle day click
  const handleDayClick = (day: number) => {
    if (day !== 0) {
      setSelectedDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
    }
  };

  // Days of the week labels
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get calendar days
  const calendarDays = getDaysInMonth(currentDate);

  // Widget view (compact calendar)
  if (isWidget) {
    return (
      <div className="calendar-widget">
        <div className="widget-header">
          <div className="current-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="mini-calendar">
          <div className="mini-calendar-header">
            {weekDays.map((day, index) => (
              <div key={index} className="day-label">
                {day.charAt(0)}
              </div>
            ))}
          </div>

          <div className="mini-calendar-days">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`mini-day ${
                  !day.isCurrentMonth ? "non-month-day" : ""
                } 
                            ${isToday(day.day) ? "today" : ""}
                            ${
                              getEventsForDate(day.day).length > 0
                                ? "has-event"
                                : ""
                            }`}
              >
                {day.day !== 0 ? day.day : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="upcoming-events">
          <h4>Upcoming</h4>
          {events.length > 0 ? (
            events
              .filter((event) => event.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 2)
              .map((event) => (
                <div key={event.id} className="widget-event">
                  <div className="event-time">{event.time}</div>
                  <div className="event-title">{event.title}</div>
                </div>
              ))
          ) : (
            <p className="no-events">No upcoming events</p>
          )}
        </div>

        <style jsx>{`
          .calendar-widget {
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 15px;
            color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            height: 100%;
            width: 100%;
          }

          .widget-header {
            text-align: center;
            margin-bottom: 10px;
          }

          .current-date {
            font-size: 16px;
            font-weight: 600;
          }

          .mini-calendar {
            margin-bottom: 15px;
          }

          .mini-calendar-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            margin-bottom: 5px;
          }

          .day-label {
            text-align: center;
            font-size: 11px;
            font-weight: 500;
            opacity: 0.7;
          }

          .mini-calendar-days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
          }

          .mini-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            border-radius: 50%;
            cursor: pointer;
          }

          .non-month-day {
            opacity: 0.3;
          }

          .today {
            background-color: rgba(0, 120, 212, 0.9);
            color: white;
            font-weight: 600;
          }

          .has-event {
            position: relative;
          }

          .has-event:after {
            content: "";
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #0078d4;
          }

          .upcoming-events {
            flex: 1;
          }

          .upcoming-events h4 {
            font-size: 14px;
            margin-bottom: 8px;
            font-weight: 600;
          }

          .widget-event {
            padding: 6px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .event-time {
            font-size: 11px;
            opacity: 0.7;
          }

          .event-title {
            font-size: 13px;
            font-weight: 500;
          }

          .no-events {
            font-size: 12px;
            opacity: 0.7;
            font-style: italic;
          }
        `}</style>
      </div>
    );
  }

  // Full app view
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Calendar</h1>
        <div className="calendar-nav">
          <button onClick={goToPreviousMonth} className="nav-btn">
            &lt;
          </button>
          <div className="current-month">{formatDate(currentDate)}</div>
          <button onClick={goToNextMonth} className="nav-btn">
            &gt;
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="days-header">
          {weekDays.map((day, index) => (
            <div key={index} className="day-name">
              {day}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`day-cell ${
                !day.isCurrentMonth ? "non-month-day" : ""
              } 
                          ${isToday(day.day) ? "today" : ""}
                          ${isSelected(day.day) ? "selected" : ""}`}
              onClick={() => handleDayClick(day.day)}
            >
              {day.day !== 0 && (
                <>
                  <div className="day-number">{day.day}</div>
                  <div className="day-events">
                    {getEventsForDate(day.day)
                      .slice(0, 3)
                      .map((event, idx) => (
                        <div
                          key={idx}
                          className={`event-dot ${
                            event.isCompleted ? "completed" : ""
                          }`}
                          title={event.title}
                        ></div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="events-panel">
        <h2 className="events-date">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>

        <div className="events-list">
          {getEventsForDate(selectedDate.getDate()).length > 0 ? (
            getEventsForDate(selectedDate.getDate()).map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-marker"></div>
                <div className="event-content">
                  <div className="event-time">{event.time}</div>
                  <div className="event-title">{event.title}</div>
                </div>
                <div className="event-actions">
                  <button className="event-action-btn">⋯</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events-message">
              No events scheduled for this day
            </div>
          )}
        </div>

        <div className="add-event">
          <button className="add-event-btn">
            <span>+</span> Add event
          </button>
        </div>
      </div>

      <style jsx>{`
        .calendar-container {
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100%;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .calendar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }

        .calendar-header h1 {
          font-size: 24px;
          font-weight: 500;
          margin: 0;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .current-month {
          font-size: 18px;
          font-weight: 500;
        }

        .nav-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-secondary);
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
        }

        .nav-btn:hover {
          background-color: var(--hover-bg);
        }

        .calendar-grid {
          padding: 20px;
        }

        .days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 10px;
        }

        .day-name {
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 0;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: 1fr;
          gap: 4px;
        }

        .day-cell {
          border-radius: 5px;
          padding: 8px;
          min-height: 80px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .day-cell:hover {
          background-color: var(--hover-bg);
        }

        .non-month-day {
          color: var(--text-color);
          opacity: 0.3;
        }

        .today {
          background-color: var(--bg-secondary);
          border: 2px solid var(--accent-color);
        }

        .selected {
          background-color: var(--selected-bg);
        }

        .day-number {
          font-weight: 500;
          margin-bottom: 5px;
        }

        .day-events {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
        }

        .event-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-color);
        }

        .event-dot.completed {
          background-color: #107c10;
        }

        .events-panel {
          padding: 20px;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
        }

        .events-date {
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 500;
        }

        .events-list {
          margin-bottom: 20px;
        }

        .event-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 5px;
        }

        .event-item:hover {
          background-color: var(--hover-bg);
        }

        .event-marker {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--accent-color);
          margin-right: 10px;
        }

        .event-content {
          flex: 1;
        }

        .event-time {
          font-size: 12px;
          opacity: 0.7;
        }

        .event-title {
          font-weight: 500;
        }

        .event-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }

        .event-item:hover .event-actions {
          opacity: 1;
        }

        .event-action-btn {
          padding: 5px;
          border-radius: 4px;
        }

        .event-action-btn:hover {
          background-color: var(--hover-bg);
        }

        .no-events-message {
          padding: 20px;
          text-align: center;
          color: var(--text-color);
          opacity: 0.7;
          font-style: italic;
        }

        .add-event {
          display: flex;
          justify-content: center;
        }

        .add-event-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 20px;
          background-color: var(--accent-color);
          color: white;
          border-radius: 20px;
          font-weight: 500;
        }

        .add-event-btn:hover {
          opacity: 0.9;
        }

        :global([data-theme="dark"]) {
          --event-bg: rgba(0, 120, 212, 0.2);
        }

        :global([data-theme="light"]) {
          --event-bg: rgba(0, 120, 212, 0.1);
        }
      `}</style>
    </div>
  );
}
