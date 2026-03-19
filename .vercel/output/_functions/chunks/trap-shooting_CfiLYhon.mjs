import { c as createComponent } from './astro-component_BREQUzXC.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_pqzVVAm0.mjs';
import { $ as $$Layout } from './Layout_CTA-Uq0K.mjs';
import { E as EventSchedule } from './EventSchedule_DW029c_u.mjs';
import { I as ICS_URL, p as parseIcs } from './ics-parser_D2p0Hvdd.mjs';

const $$TrapShooting = createComponent(async ($$result, $$props, $$slots) => {
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
    console.warn("[Trap Shooting] Build-time fetch failed:", e);
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Trap Shooting" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="page-header"> <div class="container"> <h1 class="page-title fade-up">Trap Shooting</h1> <p class="fade-up delay-1">Experience the thrill of trap shooting at the Dowagiac Conservation Club.</p> </div> </section> <section class="content-section"> <div class="container page-grid fade-up delay-2"> <div class="text-block"> <h3>Join Us on the Range</h3> <p>Open to all skill levels, join us for weekly shoots, friendly competition, and community fun in a safe, welcoming environment. Whether you're a seasoned shooter or looking to break your first clay, our two lighted outdoor trap ranges provide the perfect setting for a great time.</p> </div> ${renderComponent($$result2, "EventSchedule", EventSchedule, { "client:load": true, "eventType": "Trap Shooting", "initialEvents": buildTimeEvents, "client:component-hydration": "load", "client:component-path": "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/components/ui/EventSchedule", "client:component-export": "default" })} </div> </section> ` })}`;
}, "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/trap-shooting.astro", void 0);

const $$file = "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/trap-shooting.astro";
const $$url = "/trap-shooting";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$TrapShooting,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
