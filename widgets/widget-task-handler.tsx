import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CountdownSmallWidget } from './CountdownSmallWidget';
import { CountdownMediumWidget } from './CountdownMediumWidget';
import { CountdownLargeWidget } from './CountdownLargeWidget';
import type { WidgetData, WidgetCountdown } from '@/lib/widgetData';

const WIDGET_DATA_KEY = '@nabbihni/widget-data';
const COUNTDOWNS_KEY = '@nabbihni/countdowns';

// Default theme colors used when themes can't be resolved in headless context
const DEFAULT_BG1 = '#1a365d' as `#${string}`;
const DEFAULT_BG2 = '#0f172a' as `#${string}`;
const DEFAULT_ACCENT = '#f6ad55' as `#${string}`;

interface RawCountdown {
  id: string;
  title: string;
  icon: string;
  targetDate: string;
  isStarred?: boolean;
}

function computeTimeRemaining(targetDate: string) {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, isComplete: true };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    isComplete: false,
  };
}

function buildWidgetDataFromRaw(countdowns: RawCountdown[]): WidgetData {
  const now = Date.now();
  const sorted = [...countdowns]
    .sort((a, b) => {
      if (!!a.isStarred !== !!b.isStarred) return a.isStarred ? -1 : 1;
      const aTime = new Date(a.targetDate).getTime();
      const bTime = new Date(b.targetDate).getTime();
      const aComplete = aTime <= now;
      const bComplete = bTime <= now;
      if (aComplete !== bComplete) return aComplete ? 1 : -1;
      return aTime - bTime;
    })
    .slice(0, 5);

  const widgetCountdowns: WidgetCountdown[] = sorted.map((c) => {
    const remaining = computeTimeRemaining(c.targetDate);
    return {
      id: c.id,
      title: c.title,
      icon: c.icon || '⏳',
      targetDate: c.targetDate,
      bgColor1: DEFAULT_BG1,
      bgColor2: DEFAULT_BG2,
      accentColor: DEFAULT_ACCENT,
      isComplete: remaining.isComplete,
      isStarred: !!c.isStarred,
      daysRemaining: remaining.days,
      hoursRemaining: remaining.hours,
      minutesRemaining: remaining.minutes,
    };
  });

  return { countdowns: widgetCountdowns, updatedAt: new Date().toISOString() };
}

/**
 * Load widget data from AsyncStorage.
 * Fast path: pre-computed widget-data key.
 * Fallback: compute directly from raw countdowns key.
 */
async function loadWidgetData(): Promise<WidgetData | null> {
  // Fast path
  try {
    const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WidgetData;
      if (parsed?.countdowns?.length > 0) return parsed;
    }
  } catch {
    // fall through to fallback
  }

  // Fallback: build from raw countdowns
  try {
    const raw = await AsyncStorage.getItem(COUNTDOWNS_KEY);
    if (!raw) return null;
    const countdowns: RawCountdown[] = JSON.parse(raw);
    if (!countdowns?.length) return null;
    return buildWidgetDataFromRaw(countdowns);
  } catch {
    return null;
  }
}

/**
 * Android widget task handler
 * Runs in a headless JS context when widget needs to render
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const widgetName = widgetInfo.widgetName;

  try {
    switch (props.widgetAction) {
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED': {
        const data = await loadWidgetData();

        if (widgetName === 'CountdownSmall') {
          const first = data?.countdowns?.[0] ?? null;
          props.renderWidget(<CountdownSmallWidget countdown={first} />);
        } else if (widgetName === 'CountdownMedium') {
          const countdowns = (data?.countdowns ?? []).slice(0, 3);
          props.renderWidget(<CountdownMediumWidget countdowns={countdowns} />);
        } else if (widgetName === 'CountdownLarge') {
          const countdowns = (data?.countdowns ?? []).slice(0, 3);
          props.renderWidget(<CountdownLargeWidget countdowns={countdowns} />);
        }
        break;
      }

      case 'WIDGET_DELETED':
        break;

      case 'WIDGET_CLICK': {
        const data = await loadWidgetData();

        if (widgetName === 'CountdownSmall') {
          const first = data?.countdowns?.[0] ?? null;
          props.renderWidget(<CountdownSmallWidget countdown={first} />);
        } else if (widgetName === 'CountdownMedium') {
          const countdowns = (data?.countdowns ?? []).slice(0, 3);
          props.renderWidget(<CountdownMediumWidget countdowns={countdowns} />);
        } else if (widgetName === 'CountdownLarge') {
          const countdowns = (data?.countdowns ?? []).slice(0, 3);
          props.renderWidget(<CountdownLargeWidget countdowns={countdowns} />);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Widget task handler error:', error);
    if (widgetName === 'CountdownMedium') {
      props.renderWidget(<CountdownMediumWidget countdowns={[]} />);
    } else if (widgetName === 'CountdownLarge') {
      props.renderWidget(<CountdownLargeWidget countdowns={[]} />);
    } else {
      props.renderWidget(<CountdownSmallWidget countdown={null} />);
    }
  }
}
