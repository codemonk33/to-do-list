import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Chip,
    Modal,
    Portal,
    SegmentedButtons,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { useTask } from '@/contexts/TaskContext';
import { Task, TaskFormData } from '@/types';

interface TaskFormProps {
  visible: boolean;
  onDismiss: () => void;
  task?: Task | null;
  onSubmit: (taskData: TaskFormData) => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onDismiss,
  task,
  onSubmit,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { categories } = useTask();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    categoryId: undefined,
    dueDate: undefined,
  });
  
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        categoryId: task.categoryId,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        categoryId: undefined,
        dueDate: undefined,
      });
    }
    setErrors({});
  }, [task, visible]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dueDate: selectedDate }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
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

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView style={styles.scrollView}>
          <Text variant="headlineSmall" style={styles.title}>
            {task ? 'Edit Task' : 'Create New Task'}
          </Text>

          <TextInput
            label="Title *"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            mode="outlined"
            style={styles.input}
            error={!!errors.title}
            maxLength={100}
          />
          {errors.title && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.title}
            </Text>
          )}

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            maxLength={500}
            error={!!errors.description}
          />
          {errors.description && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.description}
            </Text>
          )}

          <Text variant="bodyMedium" style={styles.sectionTitle}>
            Priority
          </Text>
          <SegmentedButtons
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
            buttons={[
              {
                value: 'low',
                label: 'Low',
                style: { backgroundColor: formData.priority === 'low' ? '#10b981' : undefined },
              },
              {
                value: 'medium',
                label: 'Medium',
                style: { backgroundColor: formData.priority === 'medium' ? '#f59e0b' : undefined },
              },
              {
                value: 'high',
                label: 'High',
                style: { backgroundColor: formData.priority === 'high' ? '#ef4444' : undefined },
              },
            ]}
            style={styles.segmentedButtons}
          />

          <Text variant="bodyMedium" style={styles.sectionTitle}>
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <Chip
              selected={!formData.categoryId}
              onPress={() => setFormData(prev => ({ ...prev, categoryId: undefined }))}
              style={styles.categoryChip}
            >
              None
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={formData.categoryId === category.id}
                onPress={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                style={[styles.categoryChip, { borderColor: category.color }]}
                textStyle={{ color: formData.categoryId === category.id ? category.color : undefined }}
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>

          <Text variant="bodyMedium" style={styles.sectionTitle}>
            Due Date
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            icon={formData.dueDate ? 'calendar-check' : 'calendar-plus'}
          >
            {formData.dueDate ? formatDate(formData.dueDate) : 'Set Due Date'}
          </Button>
          
          {formData.dueDate && (
            <Button
              mode="text"
              onPress={() => setFormData(prev => ({ ...prev, dueDate: undefined }))}
              textColor={theme.colors.error}
              style={styles.removeDateButton}
            >
              Remove Due Date
            </Button>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={formData.dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[styles.button, styles.cancelButton]}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.button, styles.submitButton]}
              loading={isLoading}
              disabled={isLoading}
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    borderWidth: 1,
  },
  dateButton: {
    marginBottom: 8,
  },
  removeDateButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
});

export default TaskForm; 