import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';

const POLL_INTERVAL_MS = 6e4;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function formatDate(event) {
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
function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
function formatTime(event) {
  if (event.allDay) return null;
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (end) {
    const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${startTime} - ${endTime}`;
  }
  return startTime;
}
function groupEventsByMonth(events) {
  const grouped = /* @__PURE__ */ new Map();
  for (const event of events) {
    const start = new Date(event.start);
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(event);
  }
  for (const [, monthEvents] of grouped) {
    monthEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }
  return grouped;
}
function EventSchedule({ eventType, initialEvents = [] }) {
  const [allEvents, setAllEvents] = useState(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const fetchLiveEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/calendar-events");
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setAllEvents(data.events);
          setLastSync(/* @__PURE__ */ new Date());
        }
      }
    } catch (e) {
      console.warn("[EventSchedule] Failed to fetch events:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchLiveEvents]);
  const now = /* @__PURE__ */ new Date();
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  const filteredEvents = allEvents.filter((e) => {
    const eventTitle = e.title.toLowerCase();
    const typeMatch = eventTitle.includes(eventType.toLowerCase());
    const futureEvent = new Date(e.start) >= now;
    const notTooFar = new Date(e.start) <= twoYearsFromNow;
    return typeMatch && futureEvent && notTooFar;
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const groupedEvents = groupEventsByMonth(filteredEvents);
  const hasEvents = filteredEvents.length > 0;
  const currentYear = now.getFullYear();
  return /* @__PURE__ */ jsxs("div", { className: "schedule-card", children: [
    /* @__PURE__ */ jsxs("h3", { children: [
      currentYear,
      " Schedule"
    ] }),
    isLoading && /* @__PURE__ */ jsx("p", { className: "sync-status", children: "Syncing..." }),
    !hasEvents && !isLoading && /* @__PURE__ */ jsxs("div", { className: "no-events", children: [
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: eventType }) }),
      /* @__PURE__ */ jsx("p", { children: "Dates will be announced soon. Check back for updates!" })
    ] }),
    hasEvents && /* @__PURE__ */ jsx("div", { className: "schedule-list", children: Array.from(groupedEvents.entries()).map(([monthKey, events]) => {
      const [year, monthNum] = monthKey.split("-");
      const monthName = MONTHS[parseInt(monthNum) - 1];
      const monthYear = parseInt(year) === currentYear ? monthName : `${monthName} ${year}`;
      return /* @__PURE__ */ jsxs("div", { className: "schedule-month", children: [
        /* @__PURE__ */ jsx("h4", { className: "schedule-month-title", children: monthYear }),
        /* @__PURE__ */ jsx("ul", { children: events.map((event) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("span", { className: "event-date-text", children: formatDate(event) }),
          formatTime(event) && /* @__PURE__ */ jsxs("span", { className: "event-time-text", children: [
            "(",
            formatTime(event),
            ")"
          ] }),
          event.title.toLowerCase() !== eventType.toLowerCase() && /* @__PURE__ */ jsx("span", { className: "event-name", children: event.title })
        ] }, event.uid)) })
      ] }, monthKey);
    }) }),
    lastSync && !isLoading && /* @__PURE__ */ jsxs("p", { className: "last-sync", children: [
      "Last updated: ",
      lastSync.toLocaleTimeString()
    ] })
  ] });
}

export { EventSchedule as E };
