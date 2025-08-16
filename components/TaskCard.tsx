import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Checkbox, Divider, IconButton, Menu, Text } from 'react-native-paper';
import { useTask } from '@/contexts/TaskContext';
import { Category, Task } from '@/types';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, category, onEdit }) => {
  const { toggleTaskComplete, deleteTask } = useTask();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleToggleComplete = () => {
    toggleTaskComplete(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setMenuVisible(false);
  };

  const handleEdit = () => {
    onEdit(task);
    setMenuVisible(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <Card style={[styles.card, task.completed && styles.completedCard]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Checkbox
              status={task.completed ? 'checked' : 'unchecked'}
              onPress={handleToggleComplete}
              color="#3b82f6"
            />
            <View style={styles.titleContainer}>
              <Text
                variant="titleMedium"
                style={[
                  styles.title,
                  task.completed && styles.completedTitle
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  variant="bodySmall"
                  style={[
                    styles.description,
                    task.completed && styles.completedDescription
                  ]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
            </View>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
            <Divider />
            <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
          </Menu>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.tagsRow}>
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color + '20' }]}>
                <Text
                  variant="labelSmall"
                  style={[styles.categoryText, { color: category.color }]}
                >
                  {category.name}
                </Text>
              </View>
            )}
            
            <View style={[styles.priorityTag, { borderColor: getPriorityColor(task.priority) }]}>
              <Text
                variant="labelSmall"
                style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}
              >
                {getPriorityText(task.priority)}
              </Text>
            </View>
          </View>

          {task.dueDate && (
            <Text
              variant="labelSmall"
              style={[
                styles.dueDate,
                new Date(task.dueDate) < new Date() && !task.completed && styles.overdue
              ]}
            >
              Due: {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#f8fafc',
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  description: {
    color: '#6b7280',
    lineHeight: 18,
  },
  completedDescription: {
    color: '#9ca3af',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontWeight: '500',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: {
    fontWeight: '500',
  },
  dueDate: {
    color: '#6b7280',
    fontWeight: '500',
  },
  overdue: {
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default TaskCard; 