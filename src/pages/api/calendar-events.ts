import type { APIRoute } from 'astro';
import { ICS_URL, parseIcs } from '../../lib/ics-parser';

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(ICS_URL);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch calendar' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }
    
    const text = await res.text();
    
    if (!text.includes('BEGIN:VCALENDAR')) {
      return new Response(JSON.stringify({ error: 'Invalid calendar data' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }
    
    const events = parseIcs(text);
    
    return new Response(JSON.stringify({ events }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Calendar API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
};