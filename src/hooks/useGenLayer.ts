// src/hooks/useGenLayer.ts
import { useState, useEffect, useCallback } from 'react';
import { initializeGenLayer, CONTRACT_ADDRESS, parseContractDate, waitForAcceptedWithAppeal } from '@/lib/genlayer';

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
    return `${cleaned}:00`;
  } else if (parts.length === 3) {
    return cleaned;
  }
  return '00:00:00';
};

// Determine event status based on date and time
const determineStatus = (dateStr: string, timeStr: string): GenLayerEvent['status'] => {
  try {
    const now = new Date();
    const normalizedTime = normalizeTimeForParsing(timeStr);
    const eventDateStr = `${(dateStr || '').trim()}T${normalizedTime}`;
    const eventDate = parseContractDate(eventDateStr);
    
    if (!eventDate || isNaN(eventDate.getTime())) {
      console.warn(`Invalid date: ${eventDateStr}`);
      return 'upcoming';
    }
    
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff >= -2 && hoursDiff <= 2) return 'active';
    if (hoursDiff < -2) return 'past';
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
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = str.trim().match(codeBlockRegex);
  return match ? match[1].trim() : str;
};

// Generate unique ID for event
const generateEventId = (event: ContractEvent, index: number): string => {
  return `${event.title.toLowerCase().replace(/\s+/g, '-')}-${event.date}-${index}`;
};

// Transform contract events to our app format
const transformEvents = (contractEvents: ContractEvent[]): GenLayerEvent[] => {
  return contractEvents.map((event, index) => {
    const eventTime = event.time || event.start_time || 'TBD';
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

  useEffect(() => {
    const init = async () => {
      const cachedEvents = loadFromStorage();
      if (cachedEvents.length > 0) {
        setEvents(cachedEvents);
        setLastSync(getLastSync());
      }

      const client = await initializeGenLayer();
      if (client) {
        setIsInitialized(true);
        console.log('✅ GenLayer client ready');
      }
    };
    init();
  }, []);

  const readEvents = useCallback(async (): Promise<GenLayerEvent[]> => {
    const client = await initializeGenLayer();
    if (!client) throw new Error('GenLayer client not initialized');

    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'read_events',
        args: [],
      });

      let jsonString = typeof result === 'string' ? stripMarkdownCodeBlock(result) : result;
      const parsed: ContractResponse = typeof jsonString === 'string' 
        ? JSON.parse(jsonString) 
        : jsonString;

      if (!parsed.events || !Array.isArray(parsed.events)) return [];
      return transformEvents(parsed.events);
    } catch (err) {
      console.error('❌ Error reading events:', err);
      throw err;
    }
  }, []);

  // Sync events from contract
  const syncEvents = useCallback(async (): Promise<GenLayerEvent[]> => {
    const client = await initializeGenLayer();
    if (!client) throw new Error('GenLayer client not initialized');

    try {
      setSyncing(true);
      setError(null);
      console.log('🔄 Syncing events from smart contract...');

      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'sync_events',
        args: [],
        value: BigInt(0),
      });

      console.log('📝 Transaction sent! Hash:', txHash);

      // USE THE LIB HELPER: handles long wait times and auto-appeals
      await waitForAcceptedWithAppeal(txHash);

      console.log('✅ Transaction accepted, reading updated events...');
      const newEvents = await readEvents();
      
      saveToStorage(newEvents);
      setEvents(newEvents);
      setLastSync(new Date().toISOString());

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

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const contractEvents = await readEvents();
      if (contractEvents.length > 0) {
        saveToStorage(contractEvents);
        setEvents(contractEvents);
        setLastSync(new Date().toISOString());
      } else {
        await syncEvents();
      }
    } catch (err) {
      console.error('❌ Error loading events:', err);
      const cachedEvents = loadFromStorage();
      if (cachedEvents.length > 0) {
        setEvents(cachedEvents);
        setLastSync(getLastSync());
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  }, [readEvents, syncEvents]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    setEvents([]);
    setLastSync(null);
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
