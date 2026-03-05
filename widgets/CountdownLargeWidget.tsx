'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetCountdown } from '@/lib/widgetData';
import { CountdownRow } from './CountdownRow';

interface Props {
  countdowns: WidgetCountdown[];
}

function EmptyWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F1419',
        borderRadius: 24,
        padding: 20,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="⏳ كم باقي"
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#F5F3F0',
        }}
      />
      <TextWidget
        text="أضف عدادات لتظهر هنا"
        style={{
          fontSize: 13,
          color: 'rgba(245, 243, 240, 0.48)',
          marginTop: 6,
        }}
      />
    </FlexWidget>
  );
}

export function CountdownLargeWidget({ countdowns }: Props) {
  if (!countdowns || countdowns.length === 0) return <EmptyWidget />;

  // Cap at 3 to prevent overflow on the large canvas
  const rows = countdowns.slice(0, 3);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#0F1419',
        borderRadius: 24,
        padding: 20,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        <TextWidget
          text="⏳ كم باقي"
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: '#F59E0B',
          }}
        />
      </FlexWidget>

      {/* Countdown Rows */}
      {rows.map((countdown) => (
        <CountdownRow key={countdown.id} countdown={countdown} />
      ))}

      {/* Footer — fills the large canvas */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 8,
          paddingHorizontal: 4,
        }}
      >
        <TextWidget
          text="nabbihni.com"
          style={{
            fontSize: 11,
            color: 'rgba(245, 243, 240, 0.24)',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
