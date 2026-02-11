import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { PublicEvent, EventCategory, ThemeId, DateConfidence, EventRecurrenceType } from '@/types/countdown';

// Storage keys
export const EVENT_OVERRIDES_KEY = '@nabbihni/event-overrides';
export const CUSTOM_EVENTS_KEY = '@nabbihni/custom-events';

// Event override - changes to existing hardcoded events
export interface EventOverride {
  eventId: string;          // The baseId of the event being overridden
  changes: Partial<Omit<PublicEvent, 'id' | 'baseId'>>;
  overriddenAt: string;     // ISO timestamp
}

// Custom event created by admin
export interface CustomEvent extends PublicEvent {
  isCustom: true;           // Flag to identify admin-created events
  createdAt: string;        // ISO timestamp
  updatedAt?: string;       // ISO timestamp
}

// =====================
// Event Overrides CRUD
// =====================

/**
 * Get all event overrides
 */
export const getEventOverrides = async (): Promise<EventOverride[]> => {
  try {
    const data = await AsyncStorage.getItem(EVENT_OVERRIDES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting event overrides:', error);
    return [];
  }
};

/**
 * Save or update an event override
 */
export const saveEventOverride = async (
  eventId: string,
  changes: Partial<Omit<PublicEvent, 'id' | 'baseId'>>
): Promise<boolean> => {
  try {
    const overrides = await getEventOverrides();
    const existingIndex = overrides.findIndex(o => o.eventId === eventId);

    const override: EventOverride = {
      eventId,
      changes,
      overriddenAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Merge changes with existing override
      overrides[existingIndex] = {
        ...overrides[existingIndex],
        changes: { ...overrides[existingIndex].changes, ...changes },
        overriddenAt: override.overriddenAt,
      };
    } else {
      overrides.push(override);
    }

    await AsyncStorage.setItem(EVENT_OVERRIDES_KEY, JSON.stringify(overrides));
    return true;
  } catch (error) {
    console.error('Error saving event override:', error);
    return false;
  }
};

/**
 * Delete an event override (revert to original)
 */
export const deleteEventOverride = async (eventId: string): Promise<boolean> => {
  try {
    const overrides = await getEventOverrides();
    const filtered = overrides.filter(o => o.eventId !== eventId);
    await AsyncStorage.setItem(EVENT_OVERRIDES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting event override:', error);
    return false;
  }
};

/**
 * Get a specific event override
 */
export const getEventOverride = async (eventId: string): Promise<EventOverride | null> => {
  try {
    const overrides = await getEventOverrides();
    return overrides.find(o => o.eventId === eventId) || null;
  } catch (error) {
    console.error('Error getting event override:', error);
    return null;
  }
};

// =====================
// Custom Events CRUD
// =====================

/**
 * Get all custom events
 */
export const getCustomEvents = async (): Promise<CustomEvent[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_EVENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting custom events:', error);
    return [];
  }
};

/**
 * Add a new custom event
 */
export const addCustomEvent = async (
  eventData: Omit<PublicEvent, 'id' | 'baseId' | 'participantCount'> & { participantCount?: number }
): Promise<CustomEvent | null> => {
  try {
    const events = await getCustomEvents();
    const id = `custom-${uuidv4()}`;

    const newEvent: CustomEvent = {
      ...eventData,
      id,
      baseId: id,
      participantCount: eventData.participantCount || 0,
      isCustom: true,
      createdAt: new Date().toISOString(),
      recurrenceType: eventData.recurrenceType || 'one-time',
    };

    events.push(newEvent);
    await AsyncStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(events));
    return newEvent;
  } catch (error) {
    console.error('Error adding custom event:', error);
    return null;
  }
};

/**
 * Update an existing custom event
 */
export const updateCustomEvent = async (
  eventId: string,
  updates: Partial<Omit<CustomEvent, 'id' | 'baseId' | 'isCustom' | 'createdAt'>>
): Promise<CustomEvent | null> => {
  try {
    const events = await getCustomEvents();
    const index = events.findIndex(e => e.id === eventId);

    if (index === -1) {
      console.error('Custom event not found:', eventId);
      return null;
    }

    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(events));
    return events[index];
  } catch (error) {
    console.error('Error updating custom event:', error);
    return null;
  }
};

/**
 * Delete a custom event
 */
export const deleteCustomEvent = async (eventId: string): Promise<boolean> => {
  try {
    const events = await getCustomEvents();
    const filtered = events.filter(e => e.id !== eventId);
    await AsyncStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom event:', error);
    return false;
  }
};

/**
 * Get a specific custom event
 */
export const getCustomEvent = async (eventId: string): Promise<CustomEvent | null> => {
  try {
    const events = await getCustomEvents();
    return events.find(e => e.id === eventId) || null;
  } catch (error) {
    console.error('Error getting custom event:', error);
    return null;
  }
};

// =====================
// Utility Functions
// =====================

/**
 * Clear all admin data (for testing/reset)
 */
export const clearAllAdminData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([EVENT_OVERRIDES_KEY, CUSTOM_EVENTS_KEY]);
    return true;
  } catch (error) {
    console.error('Error clearing admin data:', error);
    return false;
  }
};

/**
 * Check if an event has been overridden
 */
export const hasOverride = async (eventId: string): Promise<boolean> => {
  const override = await getEventOverride(eventId);
  return override !== null;
};

/**
 * Check if an event is a custom event
 */
export const isCustomEvent = (eventId: string): boolean => {
  return eventId.startsWith('custom-');
};
