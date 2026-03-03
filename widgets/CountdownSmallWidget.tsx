'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetCountdown } from '@/lib/widgetData';

interface Props {
  countdown: WidgetCountdown | null;
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
        padding: 16,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="⏳"
        style={{ fontSize: 32 }}
      />
      <TextWidget
        text="كم باقي"
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: '#F5F3F0',
          marginTop: 8,
        }}
      />
      <TextWidget
        text="أضف عد تنازلي"
        style={{
          fontSize: 12,
          color: 'rgba(245, 243, 240, 0.48)',
          marginTop: 4,
        }}
      />
    </FlexWidget>
  );
}

export function CountdownSmallWidget({ countdown }: Props) {
  if (!countdown) return <EmptyWidget />;

  const timeText = countdown.isComplete
    ? '🎉'
    : countdown.daysRemaining > 0
    ? `${countdown.daysRemaining}`
    : countdown.hoursRemaining > 0
    ? `${countdown.hoursRemaining}`
    : `${countdown.minutesRemaining}`;

  const unitText = countdown.isComplete
    ? 'حان الوقت!'
    : countdown.daysRemaining > 0
    ? 'يوم'
    : countdown.hoursRemaining > 0
    ? 'ساعة'
    : 'دقيقة';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: countdown.bgColor1,
        borderRadius: 24,
        padding: 12,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ countdownId: countdown.id }}
    >
      {/* Emoji Icon */}
      <TextWidget
        text={countdown.icon}
        style={{ fontSize: 28 }}
      />

      {/* Big Number */}
      <TextWidget
        text={timeText}
        style={{
          fontSize: 36,
          fontWeight: '800',
          color: '#FFFFFF',
          marginTop: 4,
        }}
      />

      {/* Unit */}
      <TextWidget
        text={unitText}
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: countdown.accentColor,
        }}
      />

      {/* Title */}
      <TextWidget
        text={countdown.title}
        style={{
          fontSize: 11,
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.7)',
          marginTop: 4,
        }}
        maxLines={1}
        truncate="END"
      />
    </FlexWidget>
  );
}
