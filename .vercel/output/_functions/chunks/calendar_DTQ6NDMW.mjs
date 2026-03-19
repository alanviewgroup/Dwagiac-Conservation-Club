import { c as createComponent } from './astro-component_BREQUzXC.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_pqzVVAm0.mjs';
import { $ as $$Layout } from './Layout_CTA-Uq0K.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useRef, useCallback, useEffect } from 'react';
import { I as ICS_URL, p as parseIcs } from './ics-parser_D2p0Hvdd.mjs';

const POLL_INTERVAL_MS = 6e4;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function formatDate(date) {
  return {
    month: MONTHS[date.getMonth()].slice(0, 3),
    day: date.getDate().toString().padStart(2, "0")
  };
}
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
function getGoogleCalendarUrl(event) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const formatDateForGCal = (d) => {
    return d.toISOString().replace(/-|:|\.\d{3}/g, "");
  };
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDateForGCal(start)}/${formatDateForGCal(end)}`,
    details: event.description || "",
    location: event.location || ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function ClubCalendar({ initialEvents = [] }) {
  const [events, setEvents] = useState(initialEvents);
  const [currentDate, setCurrentDate] = useState(/* @__PURE__ */ new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const intervalRef = useRef(null);
  const fetchLiveEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/calendar-events");
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
          setLastSync(/* @__PURE__ */ new Date());
        }
      }
    } catch (e) {
      console.warn("[ClubCalendar] Failed to fetch events:", e);
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
  const prevMonthDays = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }
  const nextMonthDays = [];
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const remaining = totalCells - startOffset - daysInMonth;
  for (let i = 1; i <= remaining; i++) {
    nextMonthDays.push(i);
  }
  const today = /* @__PURE__ */ new Date();
  const isToday = (day) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };
  const hasEvent = (day) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
    });
  };
  const upcomingEvents = events.filter((e) => new Date(e.start) >= /* @__PURE__ */ new Date()).slice(0, 10);
  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "calendar-wrapper", children: [
      /* @__PURE__ */ jsxs("div", { className: "calendar-header", children: [
        /* @__PURE__ */ jsx("button", { className: "cal-nav-btn", onClick: goToPrevMonth, "aria-label": "Previous month", children: "«" }),
        /* @__PURE__ */ jsxs("h3", { className: "cal-month-year", children: [
          MONTHS[month],
          " ",
          year
        ] }),
        /* @__PURE__ */ jsx("button", { className: "cal-nav-btn", onClick: goToNextMonth, "aria-label": "Next month", children: "»" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "calendar-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "calendar-status", children: [
          isLoading && /* @__PURE__ */ jsx("span", { className: "sync-indicator loading", children: "Syncing..." }),
          lastSync && !isLoading && /* @__PURE__ */ jsxs("span", { className: "sync-indicator", children: [
            "Last sync: ",
            lastSync.toLocaleTimeString()
          ] }),
          /* @__PURE__ */ jsx("button", { className: "refresh-btn", onClick: fetchLiveEvents, disabled: isLoading, children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
            /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }),
            /* @__PURE__ */ jsx("path", { d: "M21 3v5h-5" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "calendar-grid", children: [
          /* @__PURE__ */ jsx("div", { className: "cal-weekdays", children: DAYS.map((d) => /* @__PURE__ */ jsx("div", { children: d }, d)) }),
          /* @__PURE__ */ jsxs("div", { className: "cal-days", children: [
            prevMonthDays.map((day, i) => /* @__PURE__ */ jsx("div", { className: "cal-day prev-month", children: day }, `prev-${i}`)),
            Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvents = hasEvent(day);
              const isCurrentDay = isToday(day);
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `cal-day${dayEvents.length > 0 ? " has-event" : ""}${isCurrentDay ? " today" : ""}`,
                  title: dayEvents.map((e) => e.title).join(", "),
                  children: [
                    day,
                    dayEvents.length > 0 && /* @__PURE__ */ jsx("span", { className: "event-dot" })
                  ]
                },
                `day-${day}`
              );
            }),
            nextMonthDays.map((day, i) => /* @__PURE__ */ jsx("div", { className: "cal-day next-month", children: day }, `next-${i}`))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "events-list", children: [
      /* @__PURE__ */ jsx("h3", { className: "section-title", children: "Upcoming Events" }),
      upcomingEvents.length === 0 ? /* @__PURE__ */ jsx("p", { className: "no-events", children: "No upcoming events" }) : upcomingEvents.map((event) => {
        const startDate = new Date(event.start);
        const { month: m, day: d } = formatDate(startDate);
        return /* @__PURE__ */ jsxs("div", { className: "event-card", children: [
          /* @__PURE__ */ jsxs("div", { className: "event-date", children: [
            /* @__PURE__ */ jsx("span", { className: "event-month", children: m }),
            /* @__PURE__ */ jsx("span", { className: "event-day", children: d })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "event-details", children: [
            /* @__PURE__ */ jsx("h4", { className: "event-title", children: event.title }),
            /* @__PURE__ */ jsxs("p", { className: "event-time", children: [
              /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "time-icon", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
                /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
              ] }),
              formatTime(event.start),
              " - ",
              formatTime(event.end)
            ] }),
            event.location && /* @__PURE__ */ jsxs("p", { className: "event-location", children: [
              /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "location-icon", children: [
                /* @__PURE__ */ jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
              ] }),
              event.location
            ] }),
            event.description && /* @__PURE__ */ jsx("p", { className: "event-desc", children: event.description }),
            /* @__PURE__ */ jsx("a", { href: getGoogleCalendarUrl(event), target: "_blank", rel: "noopener noreferrer", className: "add-to-calendar", children: "+ Add to Google Calendar" })
          ] })
        ] }, event.uid);
      })
    ] })
  ] });
}

const $$Calendar = createComponent(async ($$result, $$props, $$slots) => {
  let buildTimeEvents = [];
  try {
    const res = await fetch(ICS_URL);
    if (res.ok) {
      const text = await res.text();
      if (text.includes("BEGIN:VCALENDAR")) {
        buildTimeEvents = parseIcs(text);
      }
    }
  } catch (e) {
    console.warn("[Calendar] Build-time fetch failed:", e);
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Calendar" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="page-header"> <div class="container"> <h1 class="page-title fade-up">Calendar</h1> <p class="fade-up delay-1">Stay up to date with events at the Dowagiac Conservation Club.</p> </div> </section> <section class="content-section bg-light-alt"> <div class="container grid-container"> <div class="events-col slide-up delay-2"> ${renderComponent($$result2, "ClubCalendar", ClubCalendar, { "client:load": true, "initialEvents": buildTimeEvents, "client:component-hydration": "load", "client:component-path": "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/components/ui/ClubCalendar", "client:component-export": "default" })} </div> <div class="info-col slide-up delay-3"> <div class="text-block h-full"> <h3>Important Range Information</h3> <p class="highlight-box"><strong>RANGE MOWING AND MAINTENANCE OCCUR AS WEATHER AND VOLUNTEER TIME ALLOW AND WON'T APPEAR ON CALENDAR. TALK TO THE VOLUNTEER TO SEE HOW SOON YOU CAN SHOOT.</strong></p> <p>Ranges and Lake Access are for use of Members only, or as approved by the Board of Directors. Be ready to show your current membership card if asked. Unless otherwise noted in calendar, ranges are open Monday thru Sunday 9 a.m. to sunset. Read RANGE RULES before using ranges.</p> <h3 class="mt-5 text-xl">Hunter Safety Classes</h3> <p>Dates have not been set for 2026.</p> <p class="text-sm">When future dates are set Club Members with email addresses on file will be notified of the dates and how to register. To search for classes in other locations go to: <a href="https://www.michigan.gov/dnr/things-to-do/hunting/education" target="_blank" rel="noopener noreferrer" class="text-link">Michigan DNR Hunter Education</a>.</p> </div> </div> </div> </section> ` })}`;
}, "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/calendar.astro", void 0);

const $$file = "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/calendar.astro";
const $$url = "/calendar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Calendar,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
