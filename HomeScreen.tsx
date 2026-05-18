import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { fetchMarketplaceListings, MarketplaceListing } from '../services/api/marketplace';
import { colors, radii, shadows, spacing } from '../theme/tokens';

type FeedStatus = 'idle' | 'loading' | 'refreshing' | 'error' | 'success';

type ListingPrice = {
  amount?: number | string | null;
  currency?: string | null;
  formatted?: string | null;
};

type ListingSeller = {
  logo?: string | null;
  logo_url?: string | null;
  name?: string | null;
};

type ListingRating = {
  average?: number | string | null;
  count?: number | string | null;
};



type ListingCardData = MarketplaceListing & {
  coverImage?: string | null;
  cover_image?: string | null;
  discountedPrice?: ListingPrice | number | string | null;
  discounted_price?: ListingPrice | number | string | null;
  originalPrice?: ListingPrice | number | string | null;
  original_price?: ListingPrice | number | string | null;
  price?: ListingPrice | string | null;
  rating?: ListingRating | null;
  seller?: ListingSeller | null;
  sellerLogo?: string | null;
  seller_logo?: string | null;
  seller_logo_url?: string | null;
  species?: string | null;
  strain?: string | null;
  grade?: string | null;
  imageUrl?: string;
  currency?: string;
  auctionEnabled?: boolean;
};

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const formatPrice = (price: number | string | null | undefined, currency: string | null | undefined) => {
  if (price === null || price === undefined || price === '') {
    return null;
  }

  const normalizedCurrency = hasText(currency) ? currency.trim().toUpperCase() : 'USD';
  const priceText = String(price).trim();

  if (priceText.toUpperCase().includes(normalizedCurrency)) {
    return priceText;
  }

  const numericPrice = typeof price === 'number' ? price : Number(priceText.replace(/,/g, ''));

  if (!Number.isFinite(numericPrice)) {
    return `${normalizedCurrency} ${priceText}`;
  }

  return `${normalizedCurrency} ${numericPrice.toLocaleString('en-US', {
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    minimumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
  })}`;
};

const getPriceDisplay = (
  price: ListingPrice | number | string | null | undefined,
  fallbackCurrency: string | null | undefined,
) => {
  if (typeof price === 'object' && price !== null) {
    if (hasText(price.formatted)) {
      return price.formatted.trim();
    }

    return formatPrice(price.amount, price.currency ?? fallbackCurrency);
  }

  return formatPrice(price, fallbackCurrency);
};

const getInitials = (name: string | null | undefined) => {
  if (!hasText(name)) {
    return 'BV';
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'BV';
};

const getDiscountPercent = (original: string | null, discounted: string | null) => {
  if (!original || !discounted) {
    return null;
  }

  const originalValue = Number(original.replace(/[^\d.]/g, ''));
  const discountedValue = Number(discounted.replace(/[^\d.]/g, ''));

  if (!Number.isFinite(originalValue) || !Number.isFinite(discountedValue) || originalValue <= discountedValue) {
    return null;
  }

  return Math.round(((originalValue - discountedValue) / originalValue) * 100);
};

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const cardListing = listing as ListingCardData;
  const [imageFailed, setImageFailed] = useState(false);
  const [sellerLogoFailed, setSellerLogoFailed] = useState(false);

  const imageUrl = cardListing.coverImage ?? cardListing.cover_image ?? cardListing.imageUrl;
  const sellerName = cardListing.seller?.name ?? cardListing.sellerName ?? 'BETTA SOCIETY';
  const sellerLogo = cardListing.seller?.logo ?? cardListing.seller?.logo_url ?? cardListing.sellerLogo ?? cardListing.seller_logo_url ?? cardListing.seller_logo;
  const isAvailable = cardListing.saleStatus.toLowerCase() === 'available';
  const ratingCount = Number(cardListing.rating?.count ?? 0);
  const ratingAverage = Number(cardListing.rating?.average ?? 5);
  const metadata = [cardListing.species, cardListing.strain, cardListing.grade].filter(hasText).join(' • ');
  const originalPrice = getPriceDisplay(cardListing.originalPrice ?? cardListing.original_price, cardListing.currency);
  const discountedPrice = getPriceDisplay(cardListing.discountedPrice ?? cardListing.discounted_price, cardListing.currency);
  const basePrice = getPriceDisplay(cardListing.price, cardListing.currency);
  const hasDiscount = Boolean(originalPrice && discountedPrice && originalPrice !== discountedPrice);
  const discountPercent = getDiscountPercent(originalPrice, discountedPrice);
  const price = hasDiscount ? discountedPrice : basePrice;

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {hasText(imageUrl) && !imageFailed ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>Bettavaro</Text>
          </View>
        )}

        {isAvailable ? (
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableBadgeText}>Available</Text>
          </View>
        ) : null}

        {cardListing.auctionEnabled ? (
          <View style={styles.auctionBadge}>
            <Text style={styles.auctionBadgeText}>Auction</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.sellerRow}>
          {hasText(sellerLogo) && !sellerLogoFailed ? (
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={{ uri: sellerLogo }}
              style={styles.sellerLogo}
              onError={() => setSellerLogoFailed(true)}
            />
          ) : (
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>{getInitials(sellerName)}</Text>
            </View>
          )}
          <Text numberOfLines={1} style={styles.sellerName}>
            {sellerName}
          </Text>
        </View>

        <Text numberOfLines={2} style={styles.cardTitle}>
          {cardListing.title}
        </Text>

        {ratingCount > 0 ? (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>★★★★★</Text>
            <Text style={styles.ratingText}>
              {ratingAverage.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
            </Text>
          </View>
        ) : (
          <Text style={styles.noReviews}>No reviews yet</Text>
        )}

        {hasText(metadata) ? (
          <Text numberOfLines={3} style={styles.metadata}>
            {metadata}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.priceBlock}>
            {hasDiscount && originalPrice ? <Text style={styles.originalPrice}>{originalPrice}</Text> : null}
            {price ? <Text style={styles.price}>{price}</Text> : null}
          </View>

          {hasDiscount && discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity accessibilityRole="button" activeOpacity={0.82} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details →</Text>
        </TouchableOpacity>
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
    backgroundColor: colors.brand.emerald950,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.brand.emerald950,
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  imageFrame: {
    aspectRatio: 1.28,
    backgroundColor: colors.brand.emerald900,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
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
  availableBadge: {
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing[1],
    left: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    position: 'absolute',
    top: spacing[3],
  },
  availableDot: {
    backgroundColor: colors.brand.emerald700,
    borderRadius: radii.pill,
    height: 7,
    width: 7,
  },
  availableBadgeText: {
    color: colors.brand.emerald700,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
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
    color: colors.brand.emerald950,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: spacing[3],
    padding: spacing[4],
  },
  sellerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
  sellerLogo: {
    backgroundColor: colors.brand.emerald800,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    width: 36,
  },
  sellerAvatar: {
    alignItems: 'center',
    backgroundColor: colors.brand.emerald800,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sellerAvatarText: {
    color: colors.accent.gold200,
    fontSize: 12,
    fontWeight: '800',
  },
  sellerName: {
    color: colors.brand.emerald100,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: colors.neutral[0],
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
  ratingStars: {
    color: colors.accent.gold500,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  ratingText: {
    color: colors.brand.emerald100,
    fontSize: 13,
    fontWeight: '600',
  },
  noReviews: {
    color: colors.brand.emerald100,
    fontSize: 13,
    fontWeight: '600',
  },
  metadata: {
    color: colors.brand.emerald50,
    fontSize: 14,
    lineHeight: 21,
  },
  cardFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  priceBlock: {
    flex: 1,
    gap: spacing[1],
  },
  originalPrice: {
    color: colors.brand.emerald100,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  price: {
    color: colors.accent.gold500,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  discountBadge: {
    backgroundColor: colors.brand.emerald700,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  discountBadgeText: {
    color: colors.neutral[0],
    fontSize: 12,
    fontWeight: '800',
  },
  detailsButton: {
    alignSelf: 'flex-end',
    borderColor: 'rgba(216,175,97,0.55)',
    borderRadius: radii.pill,
    borderWidth: 1,
    marginTop: spacing[1],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  detailsButtonText: {
    color: colors.accent.gold500,
    fontSize: 14,
    fontWeight: '800',
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