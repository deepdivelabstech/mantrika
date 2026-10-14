import React from 'react';
import { Text, View } from 'react-native';

import { fontFamily, makeStyles, spacing } from '@/shared/theme';

type Props = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  control?: React.ReactNode;
};

/** Icon + title/description + trailing control, the row pattern used throughout Settings. */
export function IconRow({ icon, title, description, control }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.icon}>{icon}</View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {control}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { flexShrink: 0 },
  textCol: { flex: 1 },
  title: { fontSize: 15, fontFamily: fontFamily.sans600, lineHeight: 20, color: colors.ink },
  description: { marginTop: spacing.xxs, fontSize: 12, lineHeight: 16.8, color: colors.muted },
}));
