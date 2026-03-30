import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Countdown } from '@/types/countdown';
import { syncWidgetData } from '@/lib/widgetData';
import { v4 as uuidv4 } from 'uuid';

const COUNTDOWNS_KEY = '@nabbihni/countdowns';
const LAST_SYNC_KEY = '@nabbihni/last-sync-at';
const DEVICE_ID_KEY = '@nabbihni/device-id';

// Module-level user ID — set by AuthContext, read by storage.ts
// Avoids circular dependency between contexts and lib
let _currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null) {
  _currentUserId = userId;
}

export function getCurrentUserId(): string | null {
  return _currentUserId;
}

// ---- Device ID ----

async function getDeviceId(): Promise<string> {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// ---- Timestamp helpers ----

async function getLastSyncTime(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
}

async function setLastSyncTime(time: string): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, time);
}

// ---- Data converters (camelCase <-> snake_case) ----

function toCloudRow(countdown: Countdown, userId: string, deviceId: string) {
  return {
    id: countdown.id,
    user_id: userId,
    title: countdown.title,
    target_date: countdown.targetDate,
    icon: countdown.icon,
    theme: countdown.theme,
    is_public: countdown.isPublic,
    is_recurring: countdown.isRecurring ?? false,
    is_starred: countdown.isStarred ?? false,
    recurrence: countdown.recurrence ?? null,
    reminder_timing: countdown.reminderTiming ?? null,
    background_image: null, // Device-local paths, not synced in v1
    note: countdown.note ?? null,
    tasks: countdown.tasks ?? null,
    created_at: countdown.createdAt,
    updated_at: countdown.updatedAt ?? countdown.createdAt,
    deleted_at: countdown.deletedAt ?? null,
    device_id: deviceId,
  };
}

function fromCloudRow(row: any): Countdown {
  return {
    id: row.id,
    title: row.title,
    targetDate: row.target_date,
    icon: row.icon,
    theme: row.theme,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    isRecurring: row.is_recurring,
    isStarred: row.is_starred,
    recurrence: row.recurrence,
    reminderTiming: row.reminder_timing,
    backgroundImage: row.background_image,
    note: row.note,
    tasks: row.tasks,
  };
}

// ---- Initial Sync (on first login — merges local + cloud) ----

export async function initialSync(userId: string): Promise<void> {
  if (!supabase) return;

  const deviceId = await getDeviceId();

  // Read local
  const raw = await AsyncStorage.getItem(COUNTDOWNS_KEY);
  const localCountdowns: Countdown[] = raw ? JSON.parse(raw) : [];

  // Fetch all cloud countdowns for user (including soft-deleted)
  const { data: cloudRows, error } = await supabase
    .from('countdowns')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Initial sync fetch failed:', error);
    throw new Error(error.message);
  }

  const cloudMap = new Map<string, any>();
  (cloudRows ?? []).forEach((row) => cloudMap.set(row.id, row));

  const mergedCountdowns: Countdown[] = [];
  const upsertRows: any[] = [];

  // Process local countdowns
  for (const local of localCountdowns) {
    const cloud = cloudMap.get(local.id);
    const localUpdated = local.updatedAt ?? local.createdAt;

    if (!cloud) {
      // Local only — push to cloud
      const withTimestamp = { ...local, updatedAt: localUpdated };
      upsertRows.push(toCloudRow(withTimestamp, userId, deviceId));
      mergedCountdowns.push(withTimestamp);
    } else {
      const localTime = new Date(localUpdated).getTime();
      const cloudTime = new Date(cloud.updated_at).getTime();

      if (cloud.deleted_at) {
        // Cloud says deleted
        const deleteTime = new Date(cloud.deleted_at).getTime();
        if (localTime > deleteTime) {
          // Local edit is newer than cloud delete — resurrect
          const withTimestamp = { ...local, updatedAt: localUpdated, deletedAt: undefined };
          upsertRows.push(toCloudRow(withTimestamp, userId, deviceId));
          mergedCountdowns.push(withTimestamp);
        }
        // Otherwise delete wins — skip
      } else if (localTime >= cloudTime) {
        // Local wins
        const withTimestamp = { ...local, updatedAt: localUpdated };
        upsertRows.push(toCloudRow(withTimestamp, userId, deviceId));
        mergedCountdowns.push(withTimestamp);
      } else {
        // Cloud wins
        mergedCountdowns.push(fromCloudRow(cloud));
      }
      cloudMap.delete(local.id);
    }
  }

  // Cloud-only countdowns (from other devices)
  for (const [, cloud] of cloudMap) {
    if (!cloud.deleted_at) {
      mergedCountdowns.push(fromCloudRow(cloud));
    }
  }

  // Write merged to local
  await AsyncStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(mergedCountdowns));

  // Push local-only and local-wins to cloud
  if (upsertRows.length > 0) {
    const { error: upsertError } = await supabase
      .from('countdowns')
      .upsert(upsertRows, { onConflict: 'id' });
    if (upsertError) {
      console.error('Initial sync upsert failed:', upsertError);
    }
  }

  await setLastSyncTime(new Date().toISOString());
  await syncWidgetData().catch(() => {});
}

// ---- Push single operations (called from storage.ts) ----

export async function pushCreate(countdown: Countdown, userId: string): Promise<void> {
  if (!supabase) return;
  const deviceId = await getDeviceId();
  const { error } = await supabase
    .from('countdowns')
    .insert(toCloudRow(countdown, userId, deviceId));
  if (error) console.error('Cloud push create failed:', error);
}

export async function pushUpdate(countdown: Countdown, userId: string): Promise<void> {
  if (!supabase) return;
  const deviceId = await getDeviceId();
  const { error } = await supabase
    .from('countdowns')
    .upsert(toCloudRow(countdown, userId, deviceId), { onConflict: 'id' });
  if (error) console.error('Cloud push update failed:', error);
}

export async function pushDelete(countdownId: string, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('countdowns')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', countdownId)
    .eq('user_id', userId);
  if (error) console.error('Cloud push delete failed:', error);
}

// ---- Pull changes (incremental sync on app foreground) ----

export async function pullChanges(userId: string): Promise<{
  upserts: Countdown[];
  deletes: string[];
} | null> {
  if (!supabase) return null;

  const lastSync = await getLastSyncTime();
  let query = supabase
    .from('countdowns')
    .select('*')
    .eq('user_id', userId);

  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Pull changes failed:', error);
    return null;
  }

  const upserts: Countdown[] = [];
  const deletes: string[] = [];

  for (const row of data ?? []) {
    if (row.deleted_at) {
      deletes.push(row.id);
    } else {
      upserts.push(fromCloudRow(row));
    }
  }

  await setLastSyncTime(new Date().toISOString());
  return { upserts, deletes };
}

// ---- Apply pulled changes to local storage ----

export async function applyPulledChanges(
  upserts: Countdown[],
  deletes: string[]
): Promise<Countdown[]> {
  const raw = await AsyncStorage.getItem(COUNTDOWNS_KEY);
  let local: Countdown[] = raw ? JSON.parse(raw) : [];

  // Apply deletes
  if (deletes.length > 0) {
    const deleteSet = new Set(deletes);
    local = local.filter((c) => !deleteSet.has(c.id));
  }

  // Apply upserts (last-write-wins)
  for (const upsert of upserts) {
    const idx = local.findIndex((c) => c.id === upsert.id);
    if (idx >= 0) {
      const localTime = new Date(local[idx].updatedAt ?? local[idx].createdAt).getTime();
      const cloudTime = new Date(upsert.updatedAt ?? upsert.createdAt).getTime();
      if (cloudTime >= localTime) {
        local[idx] = upsert;
      }
    } else {
      local.push(upsert);
    }
  }

  await AsyncStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(local));
  await syncWidgetData().catch(() => {});
  return local;
}
