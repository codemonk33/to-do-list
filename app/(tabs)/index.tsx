import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { Task, TaskFormData } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, FAB, Searchbar, Text, useTheme } from 'react-native-paper';

const TasksScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    tasks,
    categories,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    clearError,
  } = useTask();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'pending' && !task.completed) ||
                         (filterStatus === 'completed' && task.completed);

    // Priority filter
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    // Category filter
    const matchesCategory = filterCategory === 'all' || task.categoryId === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await createTask(taskData);
      setTaskFormVisible(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData: TaskFormData) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, taskData);
        setTaskFormVisible(false);
        setEditingTask(null);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormVisible(true);
  };

  const handleDismissForm = () => {
    setTaskFormVisible(false);
    setEditingTask(null);
  };

  const getCategoryById = (categoryId?: string) => {
    if (!categoryId) return undefined;
    return categories.find(cat => cat.id === categoryId);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      category={getCategoryById(item.categoryId)}
      onEdit={handleEditTask}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyStateTitle}>
        No tasks found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyStateSubtitle}>
        {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
          ? 'Try adjusting your filters or search terms'
          : 'Create your first task to get started!'}
      </Text>
    </View>
  );

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Hello, {user?.username || 'User'}! 👋
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          You have {tasks.filter(t => !t.completed).length} pending tasks
        </Text>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search tasks..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text variant="bodyMedium" style={styles.filtersTitle}>
          Filters:
        </Text>
        
        {/* Status Filter */}
        <View style={styles.filterRow}>
          <Text variant="bodySmall" style={styles.filterLabel}>Status:</Text>
          <Chip
            selected={filterStatus === 'all'}
            onPress={() => setFilterStatus('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filterStatus === 'pending'}
            onPress={() => setFilterStatus('pending')}
            style={styles.filterChip}
          >
            Pending
          </Chip>
          <Chip
            selected={filterStatus === 'completed'}
            onPress={() => setFilterStatus('completed')}
            style={styles.filterChip}
          >
            Completed
          </Chip>
        </View>

        {/* Priority Filter */}
        <View style={styles.filterRow}>
          <Text variant="bodySmall" style={styles.filterLabel}>Priority:</Text>
          <Chip
            selected={filterPriority === 'all'}
            onPress={() => setFilterPriority('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filterPriority === 'low'}
            onPress={() => setFilterPriority('low')}
            style={[styles.filterChip, { borderColor: '#10b981' }]}
          >
            Low
          </Chip>
          <Chip
            selected={filterPriority === 'medium'}
            onPress={() => setFilterPriority('medium')}
            style={[styles.filterChip, { borderColor: '#f59e0b' }]}
          >
            Medium
          </Chip>
          <Chip
            selected={filterPriority === 'high'}
            onPress={() => setFilterPriority('high')}
            style={[styles.filterChip, { borderColor: '#ef4444' }]}
          >
            High
          </Chip>
        </View>

        {/* Category Filter */}
        <View style={styles.filterRow}>
          <Text variant="bodySmall" style={styles.filterLabel}>Category:</Text>
          <Chip
            selected={filterCategory === 'all'}
            onPress={() => setFilterCategory('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={filterCategory === category.id}
              onPress={() => setFilterCategory(category.id)}
              style={[styles.filterChip, { borderColor: category.color }]}
            >
              {category.name}
            </Chip>
          ))}
        </View>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.tasksList}
        contentContainerStyle={styles.tasksListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Create Task FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setTaskFormVisible(true)}
      />

      {/* Task Form Modal */}
      <TaskForm
        visible={taskFormVisible}
        onDismiss={handleDismissForm}
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  filtersTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    marginRight: 8,
    color: '#6b7280',
    minWidth: 60,
  },
  filterChip: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TasksScreen;
