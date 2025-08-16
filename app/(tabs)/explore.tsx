import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    SegmentedButtons,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const theme = useTheme();
  const { login, register, isLoading, error } = useAuth();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<typeof formData> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (authMode === 'register') {
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (authMode === 'register' && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.username, formData.password);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Welcome to TodoApp
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {authMode === 'login' 
              ? 'Sign in to continue managing your tasks'
              : 'Create an account to get started'
            }
          </Text>
        </View>

        <Card style={styles.authCard}>
          <Card.Content style={styles.cardContent}>
            <SegmentedButtons
              value={authMode}
              onValueChange={(value) => setAuthMode(value as 'login' | 'register')}
              buttons={[
                { value: 'login', label: 'Sign In' },
                { value: 'register', label: 'Sign Up' },
              ]}
              style={styles.segmentedButtons}
            />

            <View style={styles.form}>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!formErrors.email}
                disabled={isLoading}
              />
              {formErrors.email && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {formErrors.email}
                </Text>
              )}

              {authMode === 'register' && (
                <>
                  <TextInput
                    label="Username"
                    value={formData.username}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="none"
                    error={!!formErrors.username}
                    disabled={isLoading}
                  />
                  {formErrors.username && (
                    <Text variant="bodySmall" style={styles.errorText}>
                      {formErrors.username}
                    </Text>
                  )}
                </>
              )}

              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                error={!!formErrors.password}
                disabled={isLoading}
              />
              {formErrors.password && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {formErrors.password}
                </Text>
              )}

              {authMode === 'register' && (
                <>
                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry
                    error={!!formErrors.confirmPassword}
                    disabled={isLoading}
                  />
                  {formErrors.confirmPassword && (
                    <Text variant="bodySmall" style={styles.errorText}>
                      {formErrors.confirmPassword}
                    </Text>
                  )}
                </>
              )}

              {error && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {error}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={isLoading}
                disabled={isLoading}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              <Button
                mode="text"
                onPress={switchMode}
                style={styles.switchButton}
                disabled={isLoading}
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'
                }
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  authCard: {
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 24,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  form: {
    gap: 8,
  },
  input: {
    marginBottom: 4,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#3b82f6',
  },
  switchButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthScreen;
