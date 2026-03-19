import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ParsedEvent } from '../../lib/ics-parser';

const POLL_INTERVAL_MS = 60000;

interface ClubCalendarProps {
  initialEvents?: ParsedEvent[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(date: Date): { month: string; day: string } {
  return {
    month: MONTHS[date.getMonth()].slice(0, 3),
    day: date.getDate().toString().padStart(2, '0'),
  };
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getGoogleCalendarUrl(event: ParsedEvent): string {
  const start = new Date(event.start);
  const end = new Date(event.end);
  
  const formatDateForGCal = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d{3}/g, '');
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGCal(start)}/${formatDateForGCal(end)}`,
    details: event.description || '',
    location: event.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ClubCalendar({ initialEvents = [] }: ClubCalendarProps) {
  const [events, setEvents] = useState<ParsedEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: ParsedEvent[] } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLiveEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calendar-events');
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
          setLastSync(new Date());
        }
      }
    } catch (e) {
      console.warn('[ClubCalendar] Failed to fetch events:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveEvents();
    intervalRef.current = setInterval(fetchLiveEvents, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLiveEvents]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();

  const prevMonthDays: (number | null)[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const nextMonthDays: (number | null)[] = [];
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const remaining = totalCells - startOffset - daysInMonth;
  for (let i = 1; i <= remaining; i++) {
    nextMonthDays.push(i);
  }

  const today = new Date();
  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const getEventsForDay = (day: number): ParsedEvent[] => {
    return events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
    });
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDay({ day, events: dayEvents });
    }
  };

  const upcomingEvents = events
    .filter(e => new Date(e.start) >= new Date())
    .slice(0, 10);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  return (
    <>
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
            &laquo;
          </button>
          <h3 className="cal-month-year">{MONTHS[month]} {year}</h3>
          <button className="cal-nav-btn" onClick={goToNextMonth} aria-label="Next month">
            &raquo;
          </button>
        </div>
        <div className="calendar-content">
          <div className="calendar-status">
            {isLoading && <span className="sync-indicator loading">Syncing...</span>}
            {lastSync && !isLoading && <span className="sync-indicator">Last sync: {lastSync.toLocaleTimeString()}</span>}
            <button className="refresh-btn" onClick={fetchLiveEvents} disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
          <div className="calendar-grid">
            <div className="cal-weekdays">
              {DAYS.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="cal-days">
              {prevMonthDays.map((day, i) => (
                <div key={`prev-${i}`} className="cal-day prev-month">{day}</div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                return (
                  <div
                    key={`day-${day}`}
                    className={`cal-day${dayEvents.length > 0 ? ' has-event' : ''}${isCurrentDay ? ' today' : ''}`}
                    onClick={() => handleDayClick(day)}
                    title={dayEvents.length > 0 ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}
                  >
                    {day}
                    {dayEvents.length > 0 && <span className="event-dot" />}
                  </div>
                );
              })}
              {nextMonthDays.map((day, i) => (
                <div key={`next-${i}`} className="cal-day next-month">{day}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedDay && createPortal(
        <div className="day-events-modal" onClick={() => setSelectedDay(null)}>
          <div className="day-events-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDay(null)}>&times;</button>
            <h3 className="modal-title">Events on {MONTHS[month]} {selectedDay.day}, {year}</h3>
            <div className="modal-events-list">
              {selectedDay.events.map(event => (
                <div key={event.uid} className="modal-event-card">
                  <h4 className="modal-event-title">{event.title}</h4>
                  <p className="modal-event-time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </p>
                  {event.location && (
                    <p className="modal-event-location">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="modal-event-desc">{event.description}</p>
                  )}
                  <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="modal-add-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="14" x2="12" y2="18" />
                      <line x1="10" y1="16" x2="14" y2="16" />
                    </svg>
                    Add to Calendar
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="events-list">
        <h3 className="section-title">Upcoming Events</h3>
        {upcomingEvents.length === 0 ? (
          <p className="no-events">No upcoming events</p>
        ) : (
          upcomingEvents.map(event => {
            const startDate = new Date(event.start);
            const { month: m, day: d } = formatDate(startDate);
            return (
              <div key={event.uid} className="event-card">
                <div className="event-date">
                  <span className="event-month">{m}</span>
                  <span className="event-day">{d}</span>
                </div>
                <div className="event-details">
                  <h4 className="event-title">{event.title}</h4>
                  <p className="event-time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="time-icon">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </p>
                  {event.location && (
                    <p className="event-location">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="event-desc">{event.description}</p>
                  )}
                  <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="add-to-calendar">
                    + Add to Google Calendar
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}