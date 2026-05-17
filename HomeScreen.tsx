import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fetchMarketplaceListings, MarketplaceListing } from '../api/marketplace';
import { colors, radii, shadows, spacing } from '../theme/tokens';

type FeedStatus = 'idle' | 'loading' | 'refreshing' | 'error' | 'success';

const formatPrice = (price: string, currency: string) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return `${price} ${currency}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toLocaleString('en-US')} ${currency}`;
  }
};

const formatStatus = (status: string) =>
  status
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const price = useMemo(() => formatPrice(listing.price, listing.currency), [listing.currency, listing.price]);

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {listing.imageUrl ? (
          <Image accessibilityIgnoresInvertColors source={{ uri: listing.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>Bettavaro</Text>
          </View>
        )}
        {listing.auctionEnabled ? (
          <View style={styles.auctionBadge}>
            <Text style={styles.auctionBadgeText}>Auction</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {listing.title}
          </Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{formatStatus(listing.saleStatus)}</Text>
          </View>
          <Text style={styles.currency}>{listing.currency.toUpperCase()}</Text>
        </View>

        {listing.sellerName ? <Text style={styles.seller}>Sold by {listing.sellerName}</Text> : null}
      </View>
    </View>
  );
}

export function HomeScreen() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [status, setStatus] = useState<FeedStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const loadListings = useCallback(async (mode: 'loading' | 'refreshing' = 'loading') => {
    requestRef.current?.abort();

    const controller = new AbortController();
    requestRef.current = controller;

    setStatus(mode);
    setErrorMessage(null);

    try {
      const nextListings = await fetchMarketplaceListings(controller.signal);
      setListings(nextListings);
      setStatus('success');
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load marketplace listings.');
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    void loadListings();

    return () => requestRef.current?.abort();
  }, [loadListings]);

  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const isError = status === 'error';
  const isEmpty = status === 'success' && listings.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[colors.brand.emerald800]}
            refreshing={isRefreshing}
            tintColor={colors.accent.gold600}
            onRefresh={() => {
              void loadListings('refreshing');
            }}
          />
        }
        style={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Collector marketplace</Text>
          <Text style={styles.title}>Premium Bettas, live from Bettavaro</Text>
          <Text style={styles.subtitle}>Browse verified listings with auction and sale status surfaced up front.</Text>
        </View>

        {isLoading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color={colors.accent.gold600} size="large" />
            <Text style={styles.stateTitle}>Loading live listings</Text>
            <Text style={styles.stateCopy}>Fetching the latest marketplace feed.</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateTitle}>Marketplace unavailable</Text>
            <Text style={styles.stateCopy}>{errorMessage ?? 'Please check your connection and try again.'}</Text>
            <Pressable accessibilityRole="button" style={styles.retryButton} onPress={() => void loadListings()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {isEmpty ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateTitle}>No listings yet</Text>
            <Text style={styles.stateCopy}>Pull to refresh or check back soon for new collector-grade bettas.</Text>
          </View>
        ) : null}

        {!isLoading && !isError && listings.length > 0 ? (
          <View style={styles.feed}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brand.emerald950,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  hero: {
    backgroundColor: colors.brand.emerald950,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
  },
  eyebrow: {
    color: colors.accent.gold500,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  },
  title: {
    color: colors.neutral[0],
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 39,
  },
  subtitle: {
    color: colors.brand.emerald100,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing[3],
  },
  feed: {
    gap: spacing[4],
    padding: spacing[4],
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.neutral[0],
    borderColor: colors.neutral[200],
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageFrame: {
    aspectRatio: 1.38,
    backgroundColor: colors.brand.emerald50,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    backgroundColor: colors.brand.emerald900,
    flex: 1,
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: colors.accent.gold200,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  auctionBadge: {
    backgroundColor: colors.accent.gold600,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    position: 'absolute',
    right: spacing[3],
    top: spacing[3],
  },
  auctionBadgeText: {
    color: colors.neutral[0],
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: spacing[4],
  },
  cardHeader: {
    gap: spacing[2],
  },
  cardTitle: {
    color: colors.neutral[900],
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  price: {
    color: colors.brand.emerald800,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  statusPill: {
    backgroundColor: colors.brand.emerald50,
    borderColor: colors.brand.emerald100,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  statusText: {
    color: colors.brand.emerald700,
    fontSize: 13,
    fontWeight: '700',
  },
  currency: {
    color: colors.neutral[500],
    fontSize: 13,
    fontWeight: '700',
  },
  seller: {
    color: colors.neutral[500],
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing[3],
  },
  statePanel: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderColor: colors.neutral[200],
    borderRadius: radii.lg,
    borderWidth: 1,
    margin: spacing[4],
    padding: spacing[6],
  },
  stateTitle: {
    color: colors.neutral[900],
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing[3],
    textAlign: 'center',
  },
  stateCopy: {
    color: colors.neutral[500],
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.brand.emerald800,
    borderRadius: radii.pill,
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  retryButtonText: {
    color: colors.neutral[0],
    fontSize: 15,
    fontWeight: '700',
  },
});
