'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetCountdown } from '@/lib/widgetData';

export function CountdownRow({ countdown }: { countdown: WidgetCountdown }) {
  const timeText = countdown.isComplete
    ? 'حان الوقت! 🎉'
    : countdown.daysRemaining > 0
    ? `${countdown.daysRemaining} يوم`
    : countdown.hoursRemaining > 0
    ? `${countdown.hoursRemaining} ساعة`
    : `${countdown.minutesRemaining} دقيقة`;

  const titleText = countdown.isStarred ? `${countdown.title} ⭐` : countdown.title;

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        marginBottom: 6,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ countdownId: countdown.id }}
    >
      {/* Time Badge (left side for RTL) */}
      <FlexWidget
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: countdown.isComplete
            ? 'rgba(52, 211, 153, 0.15)'
            : 'rgba(245, 158, 11, 0.15)',
          borderRadius: 8,
        }}
      >
        <TextWidget
          text={timeText}
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: countdown.isComplete ? '#34D399' : '#F59E0B',
          }}
        />
      </FlexWidget>

      {/* Title (center) */}
      <FlexWidget
        style={{
          flex: 1,
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        <TextWidget
          text={titleText}
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#F5F3F0',
          }}
          maxLines={1}
          truncate="END"
        />
      </FlexWidget>

      {/* Emoji (right side for RTL) */}
      <FlexWidget
        style={{
          width: 36,
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
        }}
      >
        <TextWidget
          text={countdown.icon}
          style={{ fontSize: 18 }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
