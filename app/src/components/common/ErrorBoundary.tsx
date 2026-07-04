import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught an unhandled crash]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={36} color={Colors.alertOrange} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subTitle}>
              An unexpected crash occurred in the application session.
            </Text>

            {this.state.error?.message ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            ) : null}

            <Button
              title="Restart Application"
              onPress={this.handleReset}
              variant="primary"
              style={styles.retryBtn}
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.alertOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
  },
  subTitle: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Colors.spacing.lg,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: Colors.spacing.md,
    marginBottom: Colors.spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
  retryBtn: {
    width: '100%',
  },
});
