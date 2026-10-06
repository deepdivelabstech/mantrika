import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AddCustomMantraForm } from '@/features/mantra-library/components/AddCustomMantraForm';
import { DailyRecommendationCard } from '@/features/mantra-library/components/DailyRecommendationCard';
import { FilterChips } from '@/features/mantra-library/components/FilterChips';
import { MantraListItem } from '@/features/mantra-library/components/MantraListItem';
import { SearchBar } from '@/features/mantra-library/components/SearchBar';
import { AdBanner } from '@/shared/components/AdBanner';
import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { EmptyState, ErrorState } from '@/shared/components/StatusStates';
import { filterMantras, mergeMantras, pickDailyMantra } from '@/shared/lib/mantraDisplay';
import { useMantraStore } from '@/shared/store/useMantraStore';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, fontFamily, spacing } from '@/shared/theme';
import { MANTRA_CATEGORIES, type Mantra, type MantraCategory } from '@/shared/types/models';

const DEFAULT_MANTRA_ID = 'om-namah-shivaya';

type LibraryFilter = 'core' | 'all' | 'favorites' | 'mine';
type CategoryFilter = MantraCategory | 'any';

/** One in-list ad, after this many mantras, so it never sits at the top of the list. */
const AD_AFTER_INDEX = 6;
const AD_ROW = { id: '__ad__' } as const;
type Row = Mantra | typeof AD_ROW;
const isAdRow = (row: Row): row is typeof AD_ROW => row === AD_ROW;

function Separator() {
  return <View style={styles.separator} />;
}

function Footer() {
  return <View style={styles.footer} />;
}

export function MantraLibraryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LibraryFilter>('core');
  const [category, setCategory] = useState<CategoryFilter>('any');

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
  const mantraTotals = useProgressStore((s) => s.mantraTotals);
  const setCurrentMantra = useProgressStore((s) => s.setCurrentMantra);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const featured = useMemo(() => pickDailyMantra(catalog, new Date()), [catalog]);

  const customLabel = t('counter.customMantraLabel');
  const all = useMemo(
    () => mergeMantras(catalog, custom, customLabel),
    [catalog, custom, customLabel],
  );

  const pools = useMemo<Record<LibraryFilter, Mantra[]>>(
    () => ({
      core: all.filter((m) => m.core || m.id.startsWith('custom-')),
      all,
      favorites: all.filter((m) => favorites.includes(m.id)),
      mine: all.filter((m) => m.id.startsWith('custom-')),
    }),
    [all, favorites],
  );

  const categoryLabel = useCallback((c: MantraCategory) => t(`mantras.categories.${c}`), [t]);

  // Only traditions that actually have mantras get a chip.
  const categoryOptions = useMemo(() => {
    const present = new Set(all.map((m) => m.category));
    return [
      { value: 'any' as const, label: t('mantras.anyCategory'), count: all.length },
      ...MANTRA_CATEGORIES.filter((c) => present.has(c)).map((c) => ({
        value: c,
        label: categoryLabel(c),
        count: 0,
      })),
    ];
  }, [all, categoryLabel, t]);

  // A search from the default "Essentials" view looks through the whole
  // library — otherwise most of the catalog would be unfindable from there.
  const searchPool = filter === 'core' && query.trim() ? all : pools[filter];
  const categoryPool = useMemo(
    () =>
      filter === 'all' && category !== 'any'
        ? searchPool.filter((m) => m.category === category)
        : searchPool,
    [searchPool, filter, category],
  );
  const visible = useMemo(
    () => filterMantras(categoryPool, query, lang, categoryLabel),
    [categoryPool, query, lang, categoryLabel],
  );
  // No ad while searching: results should be the only thing in view.
  const rows = useMemo<Row[]>(
    () =>
      query.trim() || visible.length <= AD_AFTER_INDEX
        ? visible
        : [...visible.slice(0, AD_AFTER_INDEX), AD_ROW, ...visible.slice(AD_AFTER_INDEX)],
    [visible, query],
  );

  const goToCounter = useCallback(() => navigation.navigate('Counter' as never), [navigation]);

  const handleChant = useCallback(
    (id: string) => {
      setCurrentMantra(id);
      goToCounter();
    },
    [setCurrentMantra, goToCounter],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeCustomMantra(id);
      if (useProgressStore.getState().currentMantraId === id) setCurrentMantra(DEFAULT_MANTRA_ID);
    },
    [removeCustomMantra, setCurrentMantra],
  );

  const filterOptions = [
    { value: 'core' as const, label: t('mantras.filterCore'), count: pools.core.length },
    { value: 'all' as const, label: t('mantras.filterAll'), count: pools.all.length },
    {
      value: 'favorites' as const,
      label: t('mantras.filterFavorites'),
      count: pools.favorites.length,
    },
    { value: 'mine' as const, label: t('mantras.filterMine'), count: pools.mine.length },
  ];

  const emptyLabel = query.trim()
    ? t('mantras.noResults')
    : filter === 'favorites'
      ? t('mantras.noFavorites')
      : filter === 'mine'
        ? t('mantras.noCustom')
        : t('mantras.noResults');

  return (
    <ScreenContainer>
      <Header title={t('appTitle')} />
      <FlatList
        data={rows}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('mantras.searchPlaceholder')}
              accessibilityLabel={t('mantras.searchLabel')}
              clearLabel={t('mantras.clearSearch')}
            />

            {featured && !query.trim() ? (
              <DailyRecommendationCard
                mantra={featured}
                lang={lang}
                active={featured.id === currentMantraId}
                onStart={() => handleChant(featured.id)}
              />
            ) : null}

            <Text style={styles.libraryTitle}>{t('mantras.title')}</Text>
            <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
            {filter === 'all' ? (
              <FilterChips
                compact
                options={categoryOptions}
                value={category}
                onChange={setCategory}
              />
            ) : null}

            {filter === 'mine' ? <AddCustomMantraForm onAdd={addCustomMantra} /> : null}
          </View>
        }
        renderItem={({ item }) =>
          isAdRow(item) ? (
            <AdBanner variant="inline" />
          ) : (
            <MantraListItem
              mantra={item}
              lang={lang}
              active={item.id === currentMantraId}
              favorite={favorites.includes(item.id)}
              categoryLabel={item.category ? categoryLabel(item.category) : undefined}
              chanted={mantraTotals[item.id] ?? 0}
              onSelect={setCurrentMantra}
              onChant={handleChant}
              onToggleFavorite={toggleFavorite}
              onRemove={item.id.startsWith('custom-') ? handleRemove : undefined}
            />
          )
        }
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          catalogStatus === 'error' ? (
            <ErrorState
              label={t('common.somethingWentWrong')}
              onRetry={loadCatalog}
              retryLabel={t('common.tryAgain')}
            />
          ) : (
            <EmptyState label={emptyLabel} />
          )
        }
        ListFooterComponent={Footer}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg },
  separator: { height: spacing.sm },
  footer: { height: spacing.xl },
  headerSection: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md },
  libraryTitle: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.serif500,
    fontSize: 22,
    color: colors.ink,
  },
});
