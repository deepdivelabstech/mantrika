import * as Sentry from '@sentry/react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typeScale } from '@/shared/theme';

type Props = { children: React.ReactNode; label: string };
type State = { error: Error | null };

/**
 * Wraps a single top-level screen so a crash in one feature (e.g. a bad
 * animation frame in Counter) shows a recoverable error there instead of
 * blanking the whole app / other tabs.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack, boundary: this.props.label },
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <ErrorFallback onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.somethingWentWrong')}</Text>
      <TouchableOpacity
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.tryAgain')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t('common.tryAgain')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ground,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { ...typeScale.bodyStrong, color: colors.ink, textAlign: 'center' },
  button: {
    backgroundColor: colors.maroon,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  buttonText: { ...typeScale.bodyStrong, color: colors.white },
});
