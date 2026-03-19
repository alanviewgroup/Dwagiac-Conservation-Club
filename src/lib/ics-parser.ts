export interface ParsedEvent {
  uid: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  allDay?: boolean;
}

export const CALENDAR_ID =
  'c_50b49fd513946b69fcf08c6f24d1b61747fb7de04e2323dd04828f63aa9689fa@group.calendar.google.com';
export const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;

interface RawEvent {
  uid: string;
  summary: string;
  dtstart?: string;
  dtend?: string;
  location?: string;
  description?: string;
  rrule?: string;
  exdates: string[];
  recurrenceId?: string;
}

function unfoldLines(ics: string): string[] {
  const lines = ics.split(/\r?\n/);
  const unfolded: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.slice(1);
      }
    } else {
      unfolded.push(line);
    }
  }
  
  return unfolded;
}

function parseProperty(line: string): { name: string; params: Record<string, string>; value: string } {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) {
    return { name: line, params: {}, value: '' };
  }
  
  const namePart = line.slice(0, colonIndex);
  const value = line.slice(colonIndex + 1);
  
  const parts = namePart.split(';');
  const name = parts[0];
  const params: Record<string, string> = {};
  
  for (const part of parts.slice(1)) {
    const eqIndex = part.indexOf('=');
    if (eqIndex !== -1) {
      params[part.slice(0, eqIndex)] = part.slice(eqIndex + 1);
    }
  }
  
  return { name, params, value };
}

function parseIcsDateTime(value: string, params: Record<string, string>): Date {
  let dateStr = value;
  
  if (params.TZID) {
  }
  
  if (dateStr.includes('T')) {
    const parts = dateStr.split('T');
    const datePart = parts[0];
    let timePart = parts[1];
    
    if (timePart.endsWith('Z')) {
      timePart = timePart.slice(0, -1);
    }
    
    const year = parseInt(datePart.slice(0, 4));
    const month = parseInt(datePart.slice(4, 6)) - 1;
    const day = parseInt(datePart.slice(6, 8));
    const hour = parseInt(timePart.slice(0, 2));
    const minute = parseInt(timePart.slice(2, 4));
    const second = parseInt(timePart.slice(4, 6) || '0');
    
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  } else {
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    
    return new Date(Date.UTC(year, month, day));
  }
}

function extractTzIdFromProperty(line: string): string | null {
  const match = line.match(/TZID=([^:;]+)/);
  return match ? match[1] : null;
}

function expandRRule(rrule: string, dtstart: Date, until?: Date): Date[] {
  const occurrences: Date[] = [];
  const params: Record<string, string> = {};
  
  for (const part of rrule.split(';')) {
    const eqIndex = part.indexOf('=');
    if (eqIndex !== -1) {
      params[part.slice(0, eqIndex).toUpperCase()] = part.slice(eqIndex + 1);
    }
  }
  
  const freq = params.FREQ;
  const interval = parseInt(params.INTERVAL || '1');
  const count = params.COUNT ? parseInt(params.COUNT) : undefined;
  const untilStr = params.UNTIL;
  
  if (!freq) return [dtstart];
  
  const untilDate = untilStr ? parseIcsDateTime(untilStr, {}) : until;
  const maxDays = 365;
  const maxOccurrences = count || 100;
  
  let current = new Date(dtstart);
  let occurrenceCount = 0;
  let dayCount = 0;
  
  while (occurrenceCount < maxOccurrences && dayCount < maxDays) {
    if (untilDate && current > untilDate) break;
    
    occurrences.push(new Date(current));
    occurrenceCount++;
    
    switch (freq) {
      case 'DAILY':
        current.setUTCDate(current.getUTCDate() + interval);
        break;
      case 'WEEKLY':
        current.setUTCDate(current.getUTCDate() + (7 * interval));
        break;
      case 'MONTHLY':
        current.setUTCMonth(current.getUTCMonth() + interval);
        break;
      case 'YEARLY':
        current.setUTCFullYear(current.getUTCFullYear() + interval);
        break;
      default:
        return occurrences;
    }
    
    dayCount++;
  }
  
  return occurrences;
}

export function parseIcs(ics: string): ParsedEvent[] {
  const lines = unfoldLines(ics);
  const events: ParsedEvent[] = [];
  
  let inEvent = false;
  let currentEvent: RawEvent | null = null;
  let currentDtstartLine: string | null = null;
  let currentDtendLine: string | null = null;
  
  for (const line of lines) {
    const { name, params, value } = parseProperty(line);
    
    if (name === 'BEGIN' && value === 'VEVENT') {
      inEvent = true;
      currentEvent = { uid: '', summary: '', exdates: [] };
      currentDtstartLine = null;
      currentDtendLine = null;
    } else if (name === 'END' && value === 'VEVENT') {
      if (currentEvent && currentEvent.uid) {
        const dtstart = currentEvent.dtstart || currentDtstartLine || '';
        const dtend = currentEvent.dtend || currentDtendLine || '';
        
        if (dtstart) {
          const startDate = parseIcsDateTime(dtstart, {});
          let tzId: string | null = null;
          
          if (currentDtstartLine) {
            tzId = extractTzIdFromProperty(currentDtstartLine);
          }
          
          if (currentEvent.rrule) {
            const until = dtend ? parseIcsDateTime(dtend, {}) : undefined;
            const occurrences = expandRRule(currentEvent.rrule, startDate, until);
            
            for (const occurrence of occurrences) {
              const isExcluded = currentEvent.exdates.some(exdate => {
                const exDate = parseIcsDateTime(exdate, {});
                return exDate.getTime() === occurrence.getTime();
              });
              
              if (!isExcluded) {
                events.push({
                  uid: `${currentEvent.uid}-${occurrence.toISOString()}`,
                  title: currentEvent.summary,
                  start: occurrence.toISOString(),
                  end: dtend ? new Date(occurrence.getTime() + (parseIcsDateTime(dtend, {}).getTime() - startDate.getTime())).toISOString() : occurrence.toISOString(),
                  location: currentEvent.location,
                  description: currentEvent.description,
                  allDay: !dtstart.includes('T'),
                });
              }
            }
          } else {
            events.push({
              uid: currentEvent.uid,
              title: currentEvent.summary,
              start: startDate.toISOString(),
              end: dtend ? parseIcsDateTime(dtend, {}).toISOString() : startDate.toISOString(),
              location: currentEvent.location,
              description: currentEvent.description,
              allDay: !dtstart.includes('T'),
            });
          }
        }
      }
      inEvent = false;
      currentEvent = null;
    } else if (inEvent && currentEvent) {
      if (name === 'UID') {
        currentEvent.uid = value;
      } else if (name === 'SUMMARY') {
        currentEvent.summary = value;
      } else if (name === 'DTSTART') {
        currentEvent.dtstart = value;
        currentDtstartLine = line;
      } else if (name === 'DTEND') {
        currentEvent.dtend = value;
        currentDtendLine = line;
      } else if (name === 'LOCATION') {
        currentEvent.location = value;
      } else if (name === 'DESCRIPTION') {
        currentEvent.description = value;
      } else if (name === 'RRULE') {
        currentEvent.rrule = value;
      } else if (name === 'EXDATE') {
        currentEvent.exdates.push(value);
      }
    }
  }
  
  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}