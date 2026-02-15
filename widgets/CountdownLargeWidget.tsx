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
        text="⏳ نبّهني"
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

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: '#0F1419',
        borderRadius: 24,
        padding: 14,
      }}
    >
      {/* Header (RTL: count left, title right) */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        <TextWidget
          text={`${countdowns.length} عدادات`}
          style={{
            fontSize: 11,
            color: 'rgba(245, 243, 240, 0.48)',
          }}
        />
        <TextWidget
          text="⏳ نبّهني"
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#F59E0B',
          }}
        />
      </FlexWidget>

      {/* Countdown Rows */}
      {countdowns.map((countdown) => (
        <CountdownRow key={countdown.id} countdown={countdown} />
      ))}
    </FlexWidget>
  );
}
