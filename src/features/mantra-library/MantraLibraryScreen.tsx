import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AddCustomMantraForm } from '@/features/mantra-library/components/AddCustomMantraForm';
import { DailyRecommendationCard } from '@/features/mantra-library/components/DailyRecommendationCard';
import { MantraListItem } from '@/features/mantra-library/components/MantraListItem';
import { SearchBar } from '@/features/mantra-library/components/SearchBar';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { EmptyState, ErrorState } from '@/shared/components/StatusStates';
import { filterMantras, mergeMantras } from '@/shared/lib/mantraDisplay';
import { useMantraStore } from '@/shared/store/useMantraStore';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, spacing, typeScale } from '@/shared/theme';

const COLLAPSED_COUNT = 6;

export function MantraLibraryScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const lang = useSettingsStore((s) => s.lang);
  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);
  const catalogStatus = useMantraStore((s) => s.catalogStatus);
  const loadCatalog = useMantraStore((s) => s.loadCatalog);
  const addCustomMantra = useMantraStore((s) => s.addCustomMantra);

  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const setCurrentMantra = useProgressStore((s) => s.setCurrentMantra);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const allMantras = useMemo(
    () => mergeMantras(catalog, custom, t('counter.customMantraLabel')),
    [catalog, custom, t],
  );
  const filtered = useMemo(() => filterMantras(allMantras, query, lang), [allMantras, query, lang]);
  const visible = query.trim() || expanded ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const featured = catalog.find((m) => m.core) ?? catalog[0];

  return (
    <ScreenContainer>
      <Header title={t('mantras.title')} showSettings />
      <FlatList
        data={visible}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('mantras.searchPlaceholder')}
              accessibilityLabel={t('mantras.searchLabel')}
            />
            {!query.trim() && featured ? (
              <DailyRecommendationCard
                mantra={featured}
                lang={lang}
                onStart={() => setCurrentMantra(featured.id)}
              />
            ) : null}
            <Text style={styles.sectionTitle}>{t('mantras.title')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MantraListItem
            mantra={item}
            lang={lang}
            active={item.id === currentMantraId}
            onPress={() => setCurrentMantra(item.id)}
          />
        )}
        ListEmptyComponent={
          catalogStatus === 'error' ? (
            <ErrorState
              label={t('common.somethingWentWrong')}
              onRetry={loadCatalog}
              retryLabel={t('common.tryAgain')}
            />
          ) : (
            <EmptyState label={t('mantras.noResults')} />
          )
        }
        ListFooterComponent={
          <View style={styles.footerSection}>
            {!query.trim() && filtered.length > COLLAPSED_COUNT ? (
              <TouchableOpacity
                onPress={() => setExpanded((e) => !e)}
                accessibilityRole="button"
                accessibilityLabel={expanded ? t('mantras.showLessAria') : t('mantras.viewAllAria')}
              >
                <Text style={styles.toggle}>
                  {expanded ? t('mantras.showLess') : t('mantras.viewAll')}
                </Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.sectionTitle}>{t('mantras.addCustom')}</Text>
            <AddCustomMantraForm onAdd={addCustomMantra} />
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg, gap: spacing.sm },
  headerSection: { gap: spacing.md, marginBottom: spacing.sm },
  footerSection: { gap: spacing.md, marginTop: spacing.md },
  sectionTitle: {
    ...typeScale.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  toggle: { ...typeScale.bodyStrong, color: colors.maroon, minHeight: 44 },
});
