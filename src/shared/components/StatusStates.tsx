import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { makeStyles, spacing, typeScale, useColors } from '@/shared/theme';

export function LoadingState({ label }: { label: string }) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.maroon} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function EmptyState({ label }: { label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  label,
  onRetry,
  retryLabel,
}: {
  label: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{label}</Text>
      {onRetry && retryLabel ? (
        <Text
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          onPress={onRetry}
          style={styles.retry}
        >
          {retryLabel}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  text: { ...typeScale.body, color: colors.muted, textAlign: 'center' },
  retry: { ...typeScale.bodyStrong, color: colors.maroon },
}));
