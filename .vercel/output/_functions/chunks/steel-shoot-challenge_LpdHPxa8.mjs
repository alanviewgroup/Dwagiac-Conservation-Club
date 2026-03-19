import { c as createComponent } from './astro-component_BREQUzXC.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_pqzVVAm0.mjs';
import { $ as $$Layout } from './Layout_CTA-Uq0K.mjs';
import { E as EventSchedule } from './EventSchedule_DW029c_u.mjs';
import { I as ICS_URL, p as parseIcs } from './ics-parser_D2p0Hvdd.mjs';

const $$SteelShootChallenge = createComponent(async ($$result, $$props, $$slots) => {
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
    console.warn("[Steel Shoot] Build-time fetch failed:", e);
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Steel Shoot Challenge" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="page-header"> <div class="container"> <h1 class="page-title fade-up">Steel Shoot Challenge</h1> <p class="fade-up delay-1">Hear the Ring. Feel the Rush. Steel Shooting Starts Here.</p> </div> </section> <section class="content-section"> <div class="container page-grid fade-up delay-2"> <div class="text-block"> <h3>Put your aim, speed, and accuracy to the test!</h3> <p>Participants will engage a series of steel targets in a timed shooting event designed to challenge shooters of all skill levels. Whether you're a seasoned marksman or just looking to test your skills, the Steel Shoot Challenge is a fun, high-energy event that brings the thrill of steel target shooting to life!</p> <div class="info-grid"> <div class="info-card"> <h4>How It Works</h4> <ul> <li>Shooters will fire at multiple steel plate targets</li> <li>Targets must ring to count as a hit</li> <li>Fastest time with the most accurate hits wins</li> <li>Multiple rounds may be available</li> </ul> </div> <div class="info-card"> <h4>What to Expect</h4> <ul> <li>Safe, structured shooting environment</li> <li>Range safety officer supervision at all times</li> <li>Friendly competition and bragging rights!</li> </ul> </div> <div class="info-card"> <h4>Who Can Participate</h4> <ul> <li>Open to eligible participants (age requirements apply)</li> <li>All firearms and ammunition must meet range safety guidelines</li> <li>Eye and ear protection required</li> </ul> </div> </div> </div> ${renderComponent($$result2, "EventSchedule", EventSchedule, { "client:load": true, "eventType": "Steel Shooting", "initialEvents": buildTimeEvents, "client:component-hydration": "load", "client:component-path": "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/components/ui/EventSchedule", "client:component-export": "default" })} </div> </section> ` })}`;
}, "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/steel-shoot-challenge.astro", void 0);

const $$file = "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/steel-shoot-challenge.astro";
const $$url = "/steel-shoot-challenge";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$SteelShootChallenge,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
