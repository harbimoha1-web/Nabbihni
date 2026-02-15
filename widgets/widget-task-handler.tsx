import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CountdownSmallWidget } from './CountdownSmallWidget';
import { CountdownMediumWidget } from './CountdownMediumWidget';
import { CountdownLargeWidget } from './CountdownLargeWidget';
import type { WidgetData } from '@/lib/widgetData';

const WIDGET_DATA_KEY = '@nabbihni/widget-data';

/**
 * Load widget data from AsyncStorage
 */
async function loadWidgetData(): Promise<WidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.error('Widget: failed to load data', error);
  }
  return null;
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
          const countdowns = data?.countdowns ?? [];
          props.renderWidget(<CountdownMediumWidget countdowns={countdowns} />);
        } else if (widgetName === 'CountdownLarge') {
          const countdowns = data?.countdowns ?? [];
          props.renderWidget(<CountdownLargeWidget countdowns={countdowns} />);
        }
        break;
      }

      case 'WIDGET_DELETED':
        // Cleanup if needed
        break;

      case 'WIDGET_CLICK': {
        // Re-render with fresh data instead of flashing an empty widget
        const data = await loadWidgetData();

        if (widgetName === 'CountdownSmall') {
          const first = data?.countdowns?.[0] ?? null;
          props.renderWidget(<CountdownSmallWidget countdown={first} />);
        } else if (widgetName === 'CountdownMedium') {
          const countdowns = data?.countdowns ?? [];
          props.renderWidget(<CountdownMediumWidget countdowns={countdowns} />);
        } else if (widgetName === 'CountdownLarge') {
          const countdowns = data?.countdowns ?? [];
          props.renderWidget(<CountdownLargeWidget countdowns={countdowns} />);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Widget task handler error:', error);
    // Render fallback empty widget so it doesn't silently break
    if (widgetName === 'CountdownMedium') {
      props.renderWidget(<CountdownMediumWidget countdowns={[]} />);
    } else if (widgetName === 'CountdownLarge') {
      props.renderWidget(<CountdownLargeWidget countdowns={[]} />);
    } else {
      props.renderWidget(<CountdownSmallWidget countdown={null} />);
    }
  }
}
