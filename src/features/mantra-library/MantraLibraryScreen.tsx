import { useNavigation } from '@react-navigation/native';
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
import { colors, fontFamily, spacing } from '@/shared/theme';

const DEFAULT_MANTRA_ID = 'om-namah-shivaya';
const FEATURED_MANTRA_ID = 'gayatri-mantra';

export function MantraLibraryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const lang = useSettingsStore((s) => s.lang);
  const catalog = useMantraStore((s) => s.catalog);
  const custom = useMantraStore((s) => s.custom);
  const favorites = useMantraStore((s) => s.favorites);
  const catalogStatus = useMantraStore((s) => s.catalogStatus);
  const loadCatalog = useMantraStore((s) => s.loadCatalog);
  const addCustomMantra = useMantraStore((s) => s.addCustomMantra);
  const removeCustomMantra = useMantraStore((s) => s.removeCustomMantra);
  const toggleFavorite = useMantraStore((s) => s.toggleFavorite);

  const currentMantraId = useProgressStore((s) => s.currentMantraId);
  const setCurrentMantra = useProgressStore((s) => s.setCurrentMantra);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const featured = catalog.find((m) => m.id === FEATURED_MANTRA_ID);

  // Only core mantras + a user's own custom entries show by default; "View all"
  // reveals the rest of the catalog — matches the source design's pool logic.
  const pool = useMemo(() => {
    const catalogPool = showAll ? catalog : catalog.filter((m) => m.core);
    return mergeMantras(catalogPool, custom, t('counter.customMantraLabel'));
  }, [catalog, custom, showAll, t]);

  const visible = useMemo(() => filterMantras(pool, query, lang), [pool, query, lang]);

  const handleRemove = (id: string) => {
    removeCustomMantra(id);
    if (currentMantraId === id) setCurrentMantra(DEFAULT_MANTRA_ID);
  };

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} showSettings />
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

            <Text style={styles.eyebrow}>{t('mantras.dailyRecommendation')}</Text>
            {featured ? (
              <DailyRecommendationCard
                mantra={featured}
                onStart={() => {
                  setCurrentMantra(featured.id);
                  navigation.navigate('Counter' as never);
                }}
              />
            ) : null}

            <View style={styles.libraryHeaderRow}>
              <Text style={styles.libraryTitle}>{t('mantras.title')}</Text>
              <TouchableOpacity
                onPress={() => setShowAll((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={showAll ? t('mantras.showLessAria') : t('mantras.viewAllAria')}
              >
                <Text style={styles.toggle}>
                  {showAll ? t('mantras.showLess') : t('mantras.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>

            {showAll ? <AddCustomMantraForm onAdd={addCustomMantra} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <MantraListItem
            mantra={item}
            lang={lang}
            active={item.id === currentMantraId}
            favorite={favorites.includes(item.id)}
            onSelect={() => setCurrentMantra(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onRemove={item.id.startsWith('custom-') ? () => handleRemove(item.id) : undefined}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
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
        ListFooterComponent={<View style={{ height: spacing.xl }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg },
  headerSection: { gap: spacing.md, paddingTop: spacing.md },
  eyebrow: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontFamily: fontFamily.sans700,
    letterSpacing: 1.76,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  libraryHeaderRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  libraryTitle: { fontFamily: fontFamily.serif500, fontSize: 20, color: colors.ink },
  toggle: { fontSize: 13, fontFamily: fontFamily.sans600, color: colors.maroon, minHeight: 44 },
});
