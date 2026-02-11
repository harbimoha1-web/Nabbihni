import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Countdown, Task } from '@/types/countdown';
import {
  getCountdowns,
  getCountdown,
  createCountdown,
  updateCountdown,
  deleteCountdown,
} from '@/lib/storage';
import { checkAndAdvanceRecurringCountdown } from './useSalaryCountdown';

/**
 * Sort countdowns: starred first, then by targetDate ascending (soonest first)
 */
const sortCountdowns = (countdowns: Countdown[]): Countdown[] => {
  return [...countdowns].sort((a, b) => {
    // Starred countdowns come first
    if (a.isStarred !== b.isStarred) {
      return a.isStarred ? -1 : 1;
    }
    // Then sort by targetDate (soonest first)
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });
};

export const useCountdowns = () => {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountdowns = useCallback(async (isInitialLoad = false) => {
    try {
      // Only show loading spinner on initial load, not on refetch (fixes navigation flicker)
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      let data = await getCountdowns();

      // Check and auto-advance recurring countdowns
      const updatedData = await Promise.all(
        data.map(async (countdown) => {
          if (countdown.isRecurring && countdown.recurrence) {
            const updated = await checkAndAdvanceRecurringCountdown(countdown);
            return updated || countdown;
          }
          return countdown;
        })
      );

      // Always update with fresh sorted data (fixes background image not updating)
      setCountdowns(sortCountdowns(updatedData));
    } catch (err) {
      setError('فشل في تحميل العد التنازلي');
      if (__DEV__) console.error('Error loading countdowns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountdowns(true); // Initial load with spinner
  }, [loadCountdowns]);

  const add = useCallback(
    async (data: Omit<Countdown, 'id' | 'createdAt'>) => {
      try {
        const newCountdown = await createCountdown(data);
        setCountdowns((prev) => sortCountdowns([newCountdown, ...prev]));
        return newCountdown;
      } catch (err) {
        setError('فشل في إنشاء العد التنازلي');
        if (__DEV__) console.error('Error creating countdown:', err);
        return null;
      }
    },
    []
  );

  const update = useCallback(
    async (id: string, updates: Partial<Omit<Countdown, 'id' | 'createdAt'>>) => {
      try {
        const updated = await updateCountdown(id, updates);
        if (updated) {
          setCountdowns((prev) =>
            sortCountdowns(prev.map((c) => (c.id === id ? updated : c)))
          );
        }
        return updated;
      } catch (err) {
        setError('فشل في تحديث العد التنازلي');
        if (__DEV__) console.error('Error updating countdown:', err);
        return null;
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      const success = await deleteCountdown(id);
      if (success) {
        setCountdowns((prev) => prev.filter((c) => c.id !== id));
      }
      return success;
    } catch (err) {
      setError('فشل في حذف العد التنازلي');
      if (__DEV__) console.error('Error deleting countdown:', err);
      return false;
    }
  }, []);

  const toggleStar = useCallback(async (id: string) => {
    try {
      // Fetch fresh from storage to avoid dependency on countdowns state
      const currentCountdowns = await getCountdowns();
      const countdown = currentCountdowns.find((c) => c.id === id);
      if (!countdown) return null;

      const updated = await updateCountdown(id, {
        isStarred: !countdown.isStarred,
      });

      if (updated) {
        setCountdowns((prev) =>
          sortCountdowns(prev.map((c) => (c.id === id ? updated : c)))
        );
      }
      return updated;
    } catch (err) {
      setError('فشل في تحديث العد التنازلي');
      if (__DEV__) console.error('Error toggling star:', err);
      return null;
    }
  }, []);

  // Silent refresh (no loading spinner) for focus events
  const refresh = useCallback(() => loadCountdowns(false), [loadCountdowns]);

  return {
    countdowns,
    loading,
    error,
    add,
    update,
    remove,
    toggleStar,
    refresh,
  };
};

export const useSingleCountdown = (id: string) => {
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountdown = useCallback(async () => {
    if (!id) {
      setCountdown(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCountdown(id);
      setCountdown(data);
    } catch (err) {
      setError('فشل في تحميل العد التنازلي');
      if (__DEV__) console.error('Error loading countdown:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCountdown();
  }, [loadCountdown]);

  const update = useCallback(
    async (updates: Partial<Omit<Countdown, 'id' | 'createdAt'>>) => {
      if (!id) return null;

      try {
        const updated = await updateCountdown(id, updates);
        if (updated) {
          setCountdown(updated);
        }
        return updated;
      } catch (err) {
        setError('فشل في تحديث العد التنازلي');
        if (__DEV__) console.error('Error updating countdown:', err);
        return null;
      }
    },
    [id]
  );

  const remove = useCallback(async () => {
    if (!id) return false;

    try {
      const success = await deleteCountdown(id);
      if (success) {
        setCountdown(null);
      }
      return success;
    } catch (err) {
      setError('فشل في حذف العد التنازلي');
      if (__DEV__) console.error('Error deleting countdown:', err);
      return false;
    }
  }, [id]);

  // Task CRUD operations
  const addTask = useCallback(
    async (title: string): Promise<Task | null> => {
      if (!id || !countdown) return null;

      try {
        const newTask: Task = {
          id: uuidv4(),
          title,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          order: countdown.tasks?.length || 0,
        };
        const updatedTasks = [...(countdown.tasks || []), newTask];
        const updated = await updateCountdown(id, { tasks: updatedTasks });
        if (updated) {
          setCountdown(updated);
        }
        return newTask;
      } catch (err) {
        if (__DEV__) console.error('Error adding task:', err);
        return null;
      }
    },
    [id, countdown]
  );

  const toggleTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (!id || !countdown) return false;

      try {
        const updatedTasks = countdown.tasks?.map((t) =>
          t.id === taskId
            ? {
                ...t,
                isCompleted: !t.isCompleted,
                completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
              }
            : t
        );
        const updated = await updateCountdown(id, { tasks: updatedTasks });
        if (updated) {
          setCountdown(updated);
        }
        return true;
      } catch (err) {
        if (__DEV__) console.error('Error toggling task:', err);
        return false;
      }
    },
    [id, countdown]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (!id || !countdown) return false;

      try {
        const updatedTasks = countdown.tasks?.filter((t) => t.id !== taskId);
        const updated = await updateCountdown(id, { tasks: updatedTasks });
        if (updated) {
          setCountdown(updated);
        }
        return true;
      } catch (err) {
        if (__DEV__) console.error('Error deleting task:', err);
        return false;
      }
    },
    [id, countdown]
  );

  const reorderTasks = useCallback(
    async (taskIds: string[]): Promise<boolean> => {
      if (!id || !countdown) return false;

      try {
        const reorderedTasks = taskIds
          .map((taskId, index) => {
            const task = countdown.tasks?.find((t) => t.id === taskId);
            return task ? { ...task, order: index } : null;
          })
          .filter((t): t is Task => t !== null);
        const updated = await updateCountdown(id, { tasks: reorderedTasks });
        if (updated) {
          setCountdown(updated);
        }
        return true;
      } catch (err) {
        if (__DEV__) console.error('Error reordering tasks:', err);
        return false;
      }
    },
    [id, countdown]
  );

  return {
    countdown,
    loading,
    error,
    update,
    remove,
    refresh: loadCountdown,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  };
};

export default useCountdowns;
