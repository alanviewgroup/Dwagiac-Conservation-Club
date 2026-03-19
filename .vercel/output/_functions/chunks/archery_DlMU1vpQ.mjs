import { c as createComponent } from './astro-component_BREQUzXC.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_pqzVVAm0.mjs';
import { $ as $$Layout } from './Layout_CTA-Uq0K.mjs';
import { E as EventSchedule } from './EventSchedule_DW029c_u.mjs';
import { I as ICS_URL, p as parseIcs } from './ics-parser_D2p0Hvdd.mjs';

const $$Archery = createComponent(async ($$result, $$props, $$slots) => {
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
    console.warn("[Archery] Build-time fetch failed:", e);
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Archery" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="page-header"> <div class="container"> <h1 class="page-title fade-up">Archery</h1> <p class="fade-up delay-1">Explore archery at the Dowagiac Conservation Club! Enjoy target practice and events for all ages and skill levels in a safe and supportive outdoor environment.</p> </div> </section> <section class="content-section"> <div class="container grid-layout fade-up delay-2"> <div class="text-block"> <h3>Take Aim: Experience the Ultimate Archery Course</h3> <p>Step into the woods and test your skills on our all-Rinehart 30 target archery course, designed for both fun and challenge. Winding through the natural landscape, our course features diverse shot opportunities, from close-range precision to long-distance accuracy.</p> <p>Shooters will encounter elevated platforms, uphill shots, tight brush gaps, and even a floating target on a raft in our pond! Distances range from 8 yards on the flying carp shot to an impressive 65 yards on the buffalo target, ensuring a variety of skill-building opportunities for archers of all levels.</p> <p>We host Sunday morning shoots throughout the year, providing regular opportunities to practice, compete, and connect with fellow archers. We also host a Traditional Shoot that lasts an entire weekend, bringing together archers for a great time of shooting and camaraderie.</p> <p>We continuously upgrade and enhance the course each year to keep things fresh and exciting. Whether you're honing your skills or just out for a great day of shooting, our archery course offers an experience unlike any other.</p> <p><strong>We welcome all shooters, traditional and compound.</strong> Come challenge yourself and see what makes Dowagiac Conservation Club's archery range one of the best in the area!</p> </div> ${renderComponent($$result2, "EventSchedule", EventSchedule, { "client:load": true, "eventType": "Archery", "initialEvents": buildTimeEvents, "client:component-hydration": "load", "client:component-path": "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/components/ui/EventSchedule", "client:component-export": "default" })} </div> </section> ` })}`;
}, "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/archery.astro", void 0);

const $$file = "/Users/devamshmanoj/Dwagiac-Conservation-Club/src/pages/archery.astro";
const $$url = "/archery";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Archery,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
