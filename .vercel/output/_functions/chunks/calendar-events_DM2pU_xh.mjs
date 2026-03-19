import { I as ICS_URL, p as parseIcs } from './ics-parser_D2p0Hvdd.mjs';

const GET = async () => {
  try {
    const res = await fetch(ICS_URL);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch calendar" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) {
      return new Response(JSON.stringify({ error: "Invalid calendar data" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }
    const events = parseIcs(text);
    return new Response(JSON.stringify({ events }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("[Calendar API] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
