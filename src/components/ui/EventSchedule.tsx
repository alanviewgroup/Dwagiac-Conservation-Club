import { useState, useEffect, useCallback } from 'react';
import type { ParsedEvent } from '../../lib/ics-parser';

const POLL_INTERVAL_MS = 60000;

interface EventScheduleProps {
  eventType: 'Archery' | 'Trap Shooting' | 'Steel Shooting';
  initialEvents?: ParsedEvent[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(event: ParsedEvent): string {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  
  const startMonth = MONTHS[start.getMonth()];
  const startDay = start.getDate();
  const startYear = start.getFullYear();
  
  if (end && !event.allDay) {
    const endMonth = MONTHS[end.getMonth()];
    const endDay = end.getDate();
    const endYear = end.getFullYear();
    
    if (startMonth === endMonth && startYear === endYear) {
      if (startDay === endDay) {
        return `${startMonth} ${startDay}${getOrdinal(startDay)}`;
      }
      return `${startMonth} ${startDay}${getOrdinal(startDay)} - ${endDay}${getOrdinal(endDay)}`;
    }
    return `${startMonth} ${startDay}${getOrdinal(startDay)} - ${endMonth} ${endDay}${getOrdinal(endDay)}`;
  }
  
  return `${startMonth} ${startDay}${getOrdinal(startDay)}`;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatTime(event: ParsedEvent): string | null {
  if (event.allDay) return null;
  
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  
  const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  if (end) {
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startTime} - ${endTime}`;
  }
  
  return startTime;
}

function groupEventsByMonth(events: ParsedEvent[]): Map<string, ParsedEvent[]> {
  const grouped = new Map<string, ParsedEvent[]>();
  
  for (const event of events) {
    const start = new Date(event.start);
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  }
  
  for (const [, monthEvents] of grouped) {
    monthEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }
  
  return grouped;
}

export default function EventSchedule({ eventType, initialEvents = [] }: EventScheduleProps) {
  const [allEvents, setAllEvents] = useState<ParsedEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchLiveEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calendar-events');
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setAllEvents(data.events);
          setLastSync(new Date());
        }
      }
    } catch (e) {
      console.warn('[EventSchedule] Failed to fetch events:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchLiveEvents]);

  const now = new Date();
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  
  const filteredEvents = allEvents
    .filter(e => {
      const eventTitle = e.title.toLowerCase();
      const typeMatch = eventTitle.includes(eventType.toLowerCase());
      const futureEvent = new Date(e.start) >= now;
      const notTooFar = new Date(e.start) <= twoYearsFromNow;
      return typeMatch && futureEvent && notTooFar;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const groupedEvents = groupEventsByMonth(filteredEvents);
  const hasEvents = filteredEvents.length > 0;

  const currentYear = now.getFullYear();

  return (
    <div className="schedule-card">
      <h3>{currentYear} Schedule</h3>
      
      {isLoading && <p className="sync-status">Syncing...</p>}
      
      {!hasEvents && !isLoading && (
        <div className="no-events">
          <p><strong>{eventType}</strong></p>
          <p>Dates will be announced soon. Check back for updates!</p>
        </div>
      )}
      
      {hasEvents && (
        <div className="schedule-list">
          {Array.from(groupedEvents.entries()).map(([monthKey, events]) => {
            const [year, monthNum] = monthKey.split('-');
            const monthName = MONTHS[parseInt(monthNum) - 1];
            const monthYear = parseInt(year) === currentYear ? monthName : `${monthName} ${year}`;
            
            return (
              <div key={monthKey} className="schedule-month">
                <h4 className="schedule-month-title">{monthYear}</h4>
                <ul>
                  {events.map(event => (
                    <li key={event.uid}>
                      <span className="event-date-text">{formatDate(event)}</span>
                      {formatTime(event) && (
                        <span className="event-time-text">({formatTime(event)})</span>
                      )}
                      {event.title.toLowerCase() !== eventType.toLowerCase() && (
                        <span className="event-name">{event.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      
      {lastSync && !isLoading && (
        <p className="last-sync">Last updated: {lastSync.toLocaleTimeString()}</p>
      )}
    </div>
  );
}