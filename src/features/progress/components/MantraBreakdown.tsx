import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { displayName } from '@/shared/lib/mantraDisplay';
import { colors, fontFamily, radius, spacing } from '@/shared/theme';
import type { Language, Mantra } from '@/shared/types/models';

type Props = {
  mantraTotals: Record<string, number>;
  totalBeadsLifetime: number;
  mantras: Mantra[];
  lang: Language;
};

const MAX_ROWS = 6;

/** Lifetime beads per mantra, plus beads counted before per-mantra tracking existed. */
export const MantraBreakdown = React.memo(function MantraBreakdown({
  mantraTotals,
  totalBeadsLifetime,
  mantras,
  lang,
}: Props) {
  const { t } = useTranslation();

  const rows = useMemo(() => {
    const byId = new Map(mantras.map((m) => [m.id, m]));
    let tracked = 0;
    const list = Object.entries(mantraTotals)
      .filter(([, n]) => n > 0)
      .map(([id, total]) => {
        tracked += total;
        const m = byId.get(id);
        return {
          key: id,
          name: m ? displayName(m, lang) : t('progress.removedMantra'),
          devanagari: lang === 'hi' && !!m && !id.startsWith('custom-'),
          total,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_ROWS);
    const earlier = totalBeadsLifetime - tracked;
    if (earlier > 0) {
      list.push({ key: 'earlier', name: t('progress.earlier'), devanagari: false, total: earlier });
    }
    return list;
  }, [mantraTotals, totalBeadsLifetime, mantras, lang, t]);

  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('progress.byMantra')}</Text>
      {rows.length === 0 ? (
        <Text style={styles.empty}>{t('progress.noHistory')}</Text>
      ) : (
        rows.map((r) => (
          <View
            key={r.key}
            style={styles.row}
            accessible
            accessibilityLabel={`${r.name}: ${r.total}`}
          >
            <View style={styles.rowHead}>
              <Text
                style={[
                  styles.name,
                  r.devanagari && styles.devanagari,
                  r.key === 'earlier' && styles.muted,
                ]}
                numberOfLines={1}
              >
                {r.name}
              </Text>
              <Text style={styles.count}>{r.total.toLocaleString()}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  r.key === 'earlier' && styles.fillMuted,
                  { width: `${(r.total / max) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  label: { fontSize: 15, fontFamily: fontFamily.sans500, color: colors.ink },
  empty: { marginTop: spacing.sm, fontSize: 13, color: colors.muted },
  row: { marginTop: spacing.md },
  rowHead: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  name: { flex: 1, fontFamily: fontFamily.serif400Italic, fontSize: 17, color: colors.ink },
  devanagari: { fontFamily: fontFamily.devanagari400Italic },
  muted: { color: colors.muted },
  count: { fontFamily: fontFamily.sans600, fontSize: 13, color: colors.ink },
  track: {
    marginTop: 6,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: { height: 5, borderRadius: 3, backgroundColor: colors.maroon },
  fillMuted: { backgroundColor: '#C9B5A2' },
});
