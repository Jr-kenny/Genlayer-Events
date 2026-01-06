import { useState, useEffect } from 'react';

const SHEET_ID = '1xApbva-e21uyLo72mps_YFyfybVCVRrDw-uq7wXJsds';
const SHEET_NAME = 'Genlayer events';
const API_KEY = 'AIzaSyBqWPZ0ue_YH3RpcSSFVYhhAAndQ6pnwgI';

// Google Sheets API expects A1 notation. Sheet names with spaces must be quoted.
const PRIMARY_RANGE = `'${SHEET_NAME}'!A:Z`;
const FALLBACK_RANGE = 'A:Z';

export interface SheetEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'quiz' | 'meeting' | 'workshop' | 'ama' | 'game' | 'announcements';
  status: 'active' | 'upcoming' | 'past';
  discordLink?: string;
  timeRemaining?: string;
}

const parseEventType = (type: string): SheetEvent['type'] => {
  const normalizedType = type?.toLowerCase().trim() || 'meeting';
  const validTypes = ['quiz', 'meeting', 'workshop', 'ama', 'game', 'announcements'];
  return validTypes.includes(normalizedType) ? normalizedType as SheetEvent['type'] : 'meeting';
};

const determineEventStatus = (dateStr: string, timeStr: string): SheetEvent['status'] => {
  if (!dateStr) return 'upcoming';
  
  const now = new Date();
  const [month, day, year] = dateStr.split('/').map(Number);
  const eventDate = new Date(year, month - 1, day);
  
  // Parse time if available
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3]?.toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      eventDate.setHours(hours, minutes);
    }
  }
  
  // Calculate time difference in hours
  const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < -2) return 'past';
  if (diffHours >= -2 && diffHours <= 2) return 'active';
  return 'upcoming';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'TBD';
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const useGoogleSheets = () => {
  const [events, setEvents] = useState<SheetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const makeUrl = (range: string) =>
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;

        let response = await fetch(makeUrl(PRIMARY_RANGE));

        // If the sheet tab name is different (or parsing fails), fall back to the first sheet.
        if (!response.ok) {
          const text = await response.text();
          try {
            const parsed = JSON.parse(text);
            const msg = parsed?.error?.message as string | undefined;
            if (response.status === 400 && msg?.includes('Unable to parse range')) {
              response = await fetch(makeUrl(FALLBACK_RANGE));
            } else {
              throw new Error(msg || 'Failed to fetch sheet data');
            }
          } catch {
            if (response.status === 400 && text.includes('Unable to parse range')) {
              response = await fetch(makeUrl(FALLBACK_RANGE));
            } else {
              throw new Error('Failed to fetch sheet data');
            }
          }
        }

        if (!response.ok) {
          throw new Error('Failed to fetch sheet data');
        }
        
        const data = await response.json();
        const rows = data.values || [];
        
        // Skip header row (first row)
        const eventRows = rows.slice(1);
        
        const parsedEvents: SheetEvent[] = eventRows
          .filter((row: string[]) => row[0]) // Filter out empty rows
          .map((row: string[], index: number) => {
            const [title, description, date, time, type, discordLink] = row;
            const status = determineEventStatus(date, time);
            
            return {
              id: `event-${index}`,
              title: title || 'Untitled Event',
              description: description || '',
              date: formatDate(date),
              time: time || 'TBD',
              type: parseEventType(type),
              status,
              discordLink: discordLink || undefined,
            };
          });

        setEvents(parsedEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Google Sheets data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { events, loading, error };
};
