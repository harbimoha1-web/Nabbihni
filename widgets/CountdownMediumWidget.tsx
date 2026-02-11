'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetCountdown } from '@/lib/widgetData';

interface Props {
  countdowns: WidgetCountdown[];
}

function CountdownRow({ countdown }: { countdown: WidgetCountdown }) {
  const timeText = countdown.isComplete
    ? 'حان الوقت! 🎉'
    : countdown.daysRemaining > 0
    ? `${countdown.daysRemaining} يوم`
    : countdown.hoursRemaining > 0
    ? `${countdown.hoursRemaining} ساعة`
    : `${countdown.minutesRemaining} دقيقة`;

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
      {/* Emoji */}
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

      {/* Title */}
      <FlexWidget
        style={{
          flex: 1,
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        <TextWidget
          text={countdown.title}
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#F5F3F0',
          }}
          maxLines={1}
          truncate="END"
        />
      </FlexWidget>

      {/* Time Badge */}
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
    </FlexWidget>
  );
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

export function CountdownMediumWidget({ countdowns }: Props) {
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
      {/* Header */}
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
          text="⏳ نبّهني"
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#F59E0B',
          }}
        />
        <TextWidget
          text={`${countdowns.length} عدادات`}
          style={{
            fontSize: 11,
            color: 'rgba(245, 243, 240, 0.48)',
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
