import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task } from '@/types/countdown';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string) => Promise<Task | null>;
  onToggleTask: (taskId: string) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
}

export default function TaskList({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Sort tasks: incomplete first (by order), then completed (by completedAt)
  const sortedTasks = useMemo(() => {
    const incomplete = tasks
      .filter((t) => !t.isCompleted)
      .sort((a, b) => a.order - b.order);
    const completed = tasks
      .filter((t) => t.isCompleted)
      .sort((a, b) => {
        // Sort completed tasks by completedAt (most recent first)
        if (a.completedAt && b.completedAt) {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        }
        return a.order - b.order;
      });
    return [...incomplete, ...completed];
  }, [tasks]);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title || isAdding) return;

    setIsAdding(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await onAddTask(title);
    if (result) {
      setNewTaskTitle('');
      Keyboard.dismiss();
    }
    setIsAdding(false);
  };

  const handleSubmitEditing = () => {
    if (newTaskTitle.trim()) {
      handleAddTask();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="checkbox-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t.tasks?.title || 'Tasks'}
          </Text>
          {totalCount > 0 && (
            <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
              ({completedCount}/{totalCount})
            </Text>
          )}
        </View>
        {isAllComplete && totalCount > 0 && (
          <View style={[styles.completeBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.completeBadgeText, { color: colors.background }]}>
              {t.tasks?.ready || 'Ready!'}
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar - only show when there's actual progress */}
      {completedCount > 0 && totalCount > 0 && (
        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      )}

      {/* Task list */}
      <View style={styles.taskList}>
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </View>

      {/* Add task input */}
      <View style={[styles.addContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="add" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t.tasks?.addPlaceholder || 'Add a task...'}
          placeholderTextColor={colors.textSecondary}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="done"
          maxLength={100}
          editable={!isAdding}
        />
        {newTaskTitle.trim().length > 0 && (
          <Pressable
            onPress={handleAddTask}
            disabled={isAdding}
            style={[styles.addButton, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="arrow-up" size={18} color={colors.background} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerCount: {
    fontSize: 14,
  },
  completeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskList: {
    marginBottom: 12,
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
