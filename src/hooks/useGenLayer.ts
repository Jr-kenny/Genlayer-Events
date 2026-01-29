import { useState, useEffect, useCallback } from 'react';
import { initializeGenLayer, CONTRACT_ADDRESS } from '@/lib/genlayer';

export interface GenLayerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'quiz' | 'meeting' | 'workshop' | 'ama' | 'game' | 'announcements';
  status: 'active' | 'upcoming' | 'past';
  discordLink?: string;
}

interface ContractEvent {
  title: string;
  description: string;
  date: string;
  start_time?: string;
  time?: string;
  type: string;
  discord_link?: string;
}

interface ContractResponse {
  events: ContractEvent[];
  last_sync: string;
  total_count: number;
}

const STORAGE_KEY = 'genlayer_events_data';
const LAST_SYNC_KEY = 'genlayer_last_sync';

// Normalize time string to HH:MM:SS format for Date parsing
const normalizeTimeForParsing = (timeStr: string): string => {
  const cleaned = (timeStr || '').trim();
  if (!cleaned || cleaned === 'TBD') return '00:00:00';

  const parts = cleaned.split(':');
  if (parts.length === 2) {
    // HH:MM -> HH:MM:00
    return `${cleaned}:00`;
  } else if (parts.length === 3) {
    // Already HH:MM:SS
    return cleaned;
  }
  return '00:00:00';
};

// Determine event status based on date and time
const determineStatus = (dateStr: string, timeStr: string): GenLayerEvent['status'] => {
  try {
    const now = new Date();
    const normalizedTime = normalizeTimeForParsing(timeStr);
    const eventDate = new Date(`${(dateStr || '').trim()}T${normalizedTime}`);
    
    // If event date is invalid, default to upcoming
    if (isNaN(eventDate.getTime())) {
      console.warn(`Invalid date: ${dateStr}T${normalizedTime}`);
      return 'upcoming';
    }
    
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Active if within 2 hours of start time
    if (hoursDiff >= -2 && hoursDiff <= 2) return 'active';
    // Past if more than 2 hours ago
    if (hoursDiff < -2) return 'past';
    // Upcoming otherwise
    return 'upcoming';
  } catch (err) {
    console.warn('Error determining status:', err);
    return 'upcoming';
  }
};

// Map event type string to our enum
const mapEventType = (type: string): GenLayerEvent['type'] => {
  const normalized = type?.toLowerCase().trim() || '';
  if (normalized.includes('quiz')) return 'quiz';
  if (normalized.includes('workshop')) return 'workshop';
  if (normalized.includes('ama') || normalized.includes('ask')) return 'ama';
  if (normalized.includes('game') || normalized.includes('play')) return 'game';
  if (normalized.includes('announcement')) return 'announcements';
  if (normalized.includes('stream') || normalized.includes('live')) return 'meeting';
  return 'meeting';
};

// Strip markdown code block wrapper from JSON string
const stripMarkdownCodeBlock = (str: string): string => {
  if (typeof str !== 'string') return str;
  
  // Match ```json ... ``` or ``` ... ```
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = str.trim().match(codeBlockRegex);
  
  if (match) {
    return match[1].trim();
  }
  
  return str;
};

// Generate unique ID for event
const generateEventId = (event: ContractEvent, index: number): string => {
  return `${event.title.toLowerCase().replace(/\s+/g, '-')}-${event.date}-${index}`;
};

// Transform contract events to our app format
const transformEvents = (contractEvents: ContractEvent[]): GenLayerEvent[] => {
  return contractEvents.map((event, index) => {
    // Handle both 'time' and 'start_time' fields
    const eventTime = event.time || event.start_time || 'TBD';
    // Extract just HH:MM from HH:MM:SS if needed
    const formattedTime = eventTime.includes(':') && eventTime.split(':').length === 3
      ? eventTime.substring(0, 5)
      : eventTime;
    
    return {
      id: generateEventId(event, index),
      title: event.title,
      description: event.description,
      date: event.date,
      time: formattedTime,
      type: mapEventType(event.type),
      status: determineStatus(event.date, eventTime),
      discordLink: event.discord_link || undefined,
    };
  });
};

// Load events from local storage
const loadFromStorage = (): GenLayerEvent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const events = JSON.parse(stored) as GenLayerEvent[];
      // Recalculate status on load (in case time has passed)
      return events.map(event => ({
        ...event,
        status: determineStatus(event.date, event.time),
      }));
    }
  } catch (error) {
    console.error('Failed to load events from storage:', error);
  }
  return [];
};

// Save events to local storage
const saveToStorage = (events: GenLayerEvent[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save events to storage:', error);
  }
};

// Get last sync time
const getLastSync = (): string | null => {
  return localStorage.getItem(LAST_SYNC_KEY);
};

export const useGenLayer = () => {
  const [events, setEvents] = useState<GenLayerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Initialize and load from storage on mount
  useEffect(() => {
    const init = async () => {
      // Load cached events from storage first
      const cachedEvents = loadFromStorage();
      if (cachedEvents.length > 0) {
        setEvents(cachedEvents);
        setLastSync(getLastSync());
      }

      // Initialize GenLayer client
      const client = await initializeGenLayer();
      if (client) {
        setIsInitialized(true);
        console.log('✅ GenLayer client ready');
      } else {
        console.warn('⚠️ GenLayer client not initialized - check VITE_GENLAYER_KEY');
      }
    };

    init();
  }, []);

  // Read events from contract (view method - free, no gas)
  const readEvents = useCallback(async (): Promise<GenLayerEvent[]> => {
    const client = await initializeGenLayer();
    if (!client) {
      throw new Error('GenLayer client not initialized');
    }

    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'read_events',
        args: [],
      });

      // Parse the JSON string response (may be wrapped in markdown code blocks)
      let jsonString = typeof result === 'string' ? stripMarkdownCodeBlock(result) : result;
      const parsed: ContractResponse = typeof jsonString === 'string' 
        ? JSON.parse(jsonString) 
        : jsonString;

      if (!parsed.events || !Array.isArray(parsed.events)) {
        console.log('📭 No events in contract response');
        return [];
      }

      return transformEvents(parsed.events);
    } catch (err) {
      console.error('❌ Error reading events:', err);
      throw err;
    }
  }, []);

  // Sync events from contract (write method - requires gas, triggers AI processing)
  const syncEvents = useCallback(async (): Promise<GenLayerEvent[]> => {
    const client = await initializeGenLayer();
    if (!client) {
      throw new Error('GenLayer client not initialized');
    }

    try {
      setSyncing(true);
      setError(null);

      console.log('🔄 Syncing events from smart contract...');

      // Call sync_events write method
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sync_events',
        args: [],
        value: BigInt(0),
      });

      console.log('📝 Transaction sent! Hash:', txHash);

      // Wait for transaction to be accepted
      await client.waitForTransactionReceipt({
        hash: txHash,
        status: 'ACCEPTED',
        retries: 50,
        interval: 2000,
      });

      console.log('✅ Transaction accepted, reading updated events...');

      // Read the updated events
      const newEvents = await readEvents();
      
      // Save to local storage
      saveToStorage(newEvents);
      setEvents(newEvents);
      setLastSync(new Date().toISOString());

      console.log(`✅ Synced ${newEvents.length} events`);
      return newEvents;
    } catch (err) {
      console.error('❌ Error syncing events:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync events';
      setError(errorMessage);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [readEvents]);

  // Load events - first try reading from contract, fall back to storage
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try reading from contract first
      const contractEvents = await readEvents();
      
      if (contractEvents.length > 0) {
        saveToStorage(contractEvents);
        setEvents(contractEvents);
        setLastSync(new Date().toISOString());
        console.log(`✅ Loaded ${contractEvents.length} events from contract`);
      } else {
        // If no events in contract, try syncing
        console.log('📭 No events in contract, triggering sync...');
        await syncEvents();
      }
    } catch (err) {
      console.error('❌ Error loading events:', err);
      
      // Fall back to cached events
      const cachedEvents = loadFromStorage();
      if (cachedEvents.length > 0) {
        setEvents(cachedEvents);
        setLastSync(getLastSync());
        console.log(`📦 Using ${cachedEvents.length} cached events`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  }, [readEvents, syncEvents]);

  // Clear cached events
  const clearCache = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    setEvents([]);
    setLastSync(null);
    console.log('🗑️ Cache cleared');
  }, []);

  return {
    events,
    loading,
    syncing,
    error,
    isInitialized,
    lastSync,
    loadEvents,
    syncEvents,
    readEvents,
    clearCache,
    hasEvents: events.length > 0,
  };
};
