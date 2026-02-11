import { useState, useEffect, useCallback } from 'react';
import { PublicEvent } from '@/types/countdown';
import {
  EventOverride,
  CustomEvent,
  getEventOverrides,
  saveEventOverride,
  deleteEventOverride,
  getCustomEvents,
  addCustomEvent,
  updateCustomEvent,
  deleteCustomEvent,
  isCustomEvent,
} from '@/lib/eventAdminStorage';

interface UseEventAdminResult {
  // Data
  overrides: EventOverride[];
  customEvents: CustomEvent[];
  loading: boolean;
  saving: boolean;

  // Override operations (for editing existing hardcoded events)
  applyOverride: (eventId: string, changes: Partial<Omit<PublicEvent, 'id' | 'baseId'>>) => Promise<boolean>;
  removeOverride: (eventId: string) => Promise<boolean>;
  getOverrideForEvent: (eventId: string) => EventOverride | undefined;

  // Custom event operations (for new admin-created events)
  addEvent: (eventData: Omit<PublicEvent, 'id' | 'baseId' | 'participantCount'> & { participantCount?: number }) => Promise<CustomEvent | null>;
  updateEvent: (eventId: string, changes: Partial<Omit<CustomEvent, 'id' | 'baseId' | 'isCustom' | 'createdAt'>>) => Promise<CustomEvent | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;

  // Refresh data
  refresh: () => Promise<void>;
}

export const useEventAdmin = (): UseEventAdminResult => {
  const [overrides, setOverrides] = useState<EventOverride[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load data on mount
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedOverrides, loadedCustomEvents] = await Promise.all([
        getEventOverrides(),
        getCustomEvents(),
      ]);
      setOverrides(loadedOverrides);
      setCustomEvents(loadedCustomEvents);
    } catch (error) {
      console.error('Error loading event admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply override to an existing event
  const applyOverride = useCallback(async (
    eventId: string,
    changes: Partial<Omit<PublicEvent, 'id' | 'baseId'>>
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await saveEventOverride(eventId, changes);
      if (success) {
        await loadData();
      }
      return success;
    } finally {
      setSaving(false);
    }
  }, [loadData]);

  // Remove override (revert to original)
  const removeOverride = useCallback(async (eventId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await deleteEventOverride(eventId);
      if (success) {
        await loadData();
      }
      return success;
    } finally {
      setSaving(false);
    }
  }, [loadData]);

  // Get override for a specific event
  const getOverrideForEvent = useCallback((eventId: string): EventOverride | undefined => {
    return overrides.find(o => o.eventId === eventId);
  }, [overrides]);

  // Add new custom event
  const addEvent = useCallback(async (
    eventData: Omit<PublicEvent, 'id' | 'baseId' | 'participantCount'> & { participantCount?: number }
  ): Promise<CustomEvent | null> => {
    setSaving(true);
    try {
      const newEvent = await addCustomEvent(eventData);
      if (newEvent) {
        await loadData();
      }
      return newEvent;
    } finally {
      setSaving(false);
    }
  }, [loadData]);

  // Update custom event
  const updateEvent = useCallback(async (
    eventId: string,
    changes: Partial<Omit<CustomEvent, 'id' | 'baseId' | 'isCustom' | 'createdAt'>>
  ): Promise<CustomEvent | null> => {
    setSaving(true);
    try {
      const updated = await updateCustomEvent(eventId, changes);
      if (updated) {
        await loadData();
      }
      return updated;
    } finally {
      setSaving(false);
    }
  }, [loadData]);

  // Delete custom event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await deleteCustomEvent(eventId);
      if (success) {
        await loadData();
      }
      return success;
    } finally {
      setSaving(false);
    }
  }, [loadData]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    overrides,
    customEvents,
    loading,
    saving,
    applyOverride,
    removeOverride,
    getOverrideForEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    refresh,
  };
};

export default useEventAdmin;
