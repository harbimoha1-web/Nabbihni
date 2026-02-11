import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task } from '@/types/countdown';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_THRESHOLD = -80;

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, DELETE_THRESHOLD - 20));
          deleteOpacity.setValue(Math.min(1, Math.abs(gestureState.dx) / Math.abs(DELETE_THRESHOLD)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < DELETE_THRESHOLD) {
          // Delete action
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <View style={styles.container}>
      {/* Delete background */}
      <Animated.View
        style={[
          styles.deleteBackground,
          { backgroundColor: colors.error, opacity: deleteOpacity },
        ]}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </Animated.View>

      {/* Task content */}
      <Animated.View
        style={[
          styles.content,
          { backgroundColor: colors.surface, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={handleToggle}
          style={[
            styles.checkbox,
            {
              borderColor: task.isCompleted ? colors.accent : colors.textSecondary,
              backgroundColor: task.isCompleted ? colors.accent : 'transparent',
            },
          ]}
        >
          {task.isCompleted && (
            <Ionicons name="checkmark" size={16} color={colors.background} />
          )}
        </Pressable>

        <Text
          style={[
            styles.title,
            { color: task.isCompleted ? colors.textSecondary : colors.text },
            task.isCompleted && styles.completedTitle,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
});
