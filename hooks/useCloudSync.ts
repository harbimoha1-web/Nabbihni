import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { initialSync, pullChanges, applyPulledChanges } from '@/lib/cloudSync';

export function useCloudSync() {
  const { user, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const hasRunInitialSync = useRef(false);

  // Initial sync when user first authenticates
  useEffect(() => {
    if (isAuthenticated && user && !hasRunInitialSync.current) {
      hasRunInitialSync.current = true;
      setIsSyncing(true);
      setLastSyncError(null);
      initialSync(user.id)
        .catch((err) => setLastSyncError(err.message))
        .finally(() => setIsSyncing(false));
    }
    if (!isAuthenticated) {
      hasRunInitialSync.current = false;
      setLastSyncError(null);
    }
  }, [isAuthenticated, user]);

  // Pull changes when app returns to foreground
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        backgroundPull();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated, user]);

  const backgroundPull = useCallback(async () => {
    if (!user) return;
    try {
      const changes = await pullChanges(user.id);
      if (changes && (changes.upserts.length > 0 || changes.deletes.length > 0)) {
        await applyPulledChanges(changes.upserts, changes.deletes);
      }
      setLastSyncError(null);
    } catch (err: any) {
      setLastSyncError(err.message);
    }
  }, [user]);

  return { isSyncing, lastSyncError, backgroundPull };
}
