import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ListingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ListingDetail'>;

type ListingRecord = Record<string, unknown>;

type RatingRecord = {
  average?: number | string | null;
  avg?: number | string | null;
  count?: number | string | null;
};

const isRecord = (value: unknown): value is ListingRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const getString = (listing: ListingRecord, keys: string[]) => {
  for (const key of keys) {
    const value = listing[key];

    if (hasText(value)) {
      return value.trim();
    }
  }

  return null;
};

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getNumber = (listing: ListingRecord, keys: string[]) => {
  for (const key of keys) {
    const value = toNumber(listing[key]);

    if (value !== null) {
      return value;
    }
  }

  return null;
};

const getRawPriceValue = (listing: ListingRecord, keys: string[]) => {
  for (const key of keys) {
    const value = listing[key];

    if (typeof value === 'number') {
      return value;
    }

    if (hasText(value)) {
      return value.trim();
    }
  }

  return null;
};


const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return hasText(value) ? ['1', 'true', 'yes'].includes(value.trim().toLowerCase()) : false;
};

const getBoolean = (listing: ListingRecord, keys: string[]) => keys.some((key) => toBoolean(listing[key]));

const formatStatus = (status: string) =>
  status
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatPrice = (price: number | string | null, currency: string) => {
  if (price === null || price === '') {
    return 'Contact for price';
  }

  const normalizedCurrency = currency.toUpperCase();
  const priceText = String(price).trim();

  if (priceText.toUpperCase().includes(normalizedCurrency)) {
    return priceText;
  }

  const numericPrice = Number(priceText.replace(/,/g, ''));

  if (!Number.isFinite(numericPrice)) {
    return `${priceText} ${normalizedCurrency}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toLocaleString('en-US')} ${normalizedCurrency}`;
  }
};

const isUnavailablePrice = (price: unknown) => {
  if (price === null || price === undefined) {
    return true;
  }

  if (typeof price === 'number') {
    return price === 0;
  }

  if (typeof price === 'string') {
    const priceText = price.trim();

    if (priceText.length === 0) {
      return true;
    }

    return toNumber(priceText) === 0;
  }

  return false;
};

const formatListingPrice = (listing: ListingRecord, currency: string) => {
  const formattedPrice = getString(listing, ['priceFormatted']);

  if (formattedPrice !== null && formattedPrice !== 'Price unavailable') {
    return formattedPrice;
  }

  const rawPrice = getRawPriceValue(listing, [
    'discountedPrice',
    'discounted_price',
    'finalPrice',
    'final_price',
    'price',
    'basePrice',
    'base_price',
    'priceAmount',
  ]);

  if (isUnavailablePrice(rawPrice)) {
    return 'Contact for price';
  }

  if (typeof rawPrice === 'number' || typeof rawPrice === 'string') {
    return formatPrice(rawPrice, currency);
  }

  return 'Contact for price';
};


const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || 'B';

export function ListingDetailScreen({ navigation, route }: ListingDetailScreenProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const listing = useMemo(() => (isRecord(route.params.listing) ? route.params.listing : {}), [route.params.listing]);

  const title = getString(listing, ['title', 'name']) ?? `Listing #${route.params.listingId}`;
   const currency = getString(listing, ['priceCurrency', 'currency', 'price_currency']) ?? 'USD';
  const imageUrl = getString(listing, ['coverImage', 'imageUrl', 'image_url', 'cover_image', 'cover_image_url']); 
  const sellerName =
    getString(listing, ['sellerName', 'seller_name', 'farmName', 'farm_name', 'seller', 'farm']) ?? 'Bettavaro Seller';
  const sellerLogo = getString(listing, ['sellerLogo', 'seller_logo', 'farmLogo', 'farm_logo', 'logoUrl', 'logo_url']);
  const description =
    getString(listing, ['shortDescription', 'short_description', 'description']) ?? 'No description available yet.';
  const isAuction = getBoolean(listing, ['auctionEnabled', 'auction_enabled', 'isAuction', 'is_auction']);
  const saleStatus = getString(listing, ['saleStatus', 'sale_status', 'status']) ?? 'available';
  const ratingValue = listing.rating;
  const ratingRecord = isRecord(ratingValue) ? (ratingValue as RatingRecord) : null;
  const ratingAverage =
    getNumber(listing, ['avgRating', 'avg_rating', 'reviewAverage', 'review_average']) ??
    toNumber(ratingRecord?.average ?? ratingRecord?.avg ?? ratingValue);
  const reviewCount = getNumber(listing, ['reviewCount', 'review_count', 'reviews_count']) ?? toNumber(ratingRecord?.count);
  const originalPriceValue = getNumber(listing, ['originalPrice', 'original_price']);
  const discountedPriceValue = getNumber(listing, ['discountedPrice', 'discounted_price', 'finalPrice', 'final_price']);
  const hasDiscount =
    originalPriceValue !== null && discountedPriceValue !== null && originalPriceValue > discountedPriceValue;
  const currentPrice = formatListingPrice(listing, currency);
  const originalPrice = hasDiscount ? formatPrice(originalPriceValue, currency) : null;
  const basicInfo = [
    ['Species', getString(listing, ['species'])],
    ['Strain', getString(listing, ['strain'])],
    ['Gender', getString(listing, ['gender', 'sex'])],
    ['Size', getString(listing, ['size'])],
    ['Age', getString(listing, ['age'])],
  ].filter((item): item is [string, string] => hasText(item[1]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
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
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{formatStatus(saleStatus)}</Text>
            </View>
            {isAuction ? (
              <View style={styles.auctionBadge}>
                <Text style={styles.auctionBadgeText}>Auction</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.priceRow}>
            {originalPrice ? <Text style={styles.originalPrice}>{originalPrice}</Text> : null}
            <Text style={styles.price}>{currentPrice}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{ratingAverage !== null ? '★★★★★' : '☆☆☆☆☆'}</Text>
            <Text style={styles.ratingText}>
              {ratingAverage !== null
                ? `${ratingAverage.toFixed(1)}${reviewCount !== null ? ` (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})` : ''}`
                : 'No reviews yet'}
            </Text>
          </View>

          <View style={styles.sellerRow}>
            {hasText(sellerLogo) && !logoFailed ? (
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={{ uri: sellerLogo }}
                style={styles.sellerLogo}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <View style={styles.sellerInitial}>
                <Text style={styles.sellerInitialText}>{getInitial(sellerName)}</Text>
              </View>
            )}
            <Text numberOfLines={1} style={styles.sellerName}>
              {sellerName}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {basicInfo.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              <View style={styles.infoGrid}>
                {basicInfo.map(([label, value]) => (
                  <View key={label} style={styles.infoItem}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => console.log('Add to Cart', route.params.listingId)}>
              <Text style={styles.primaryButtonText}>Add to Cart</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => console.log('Make Offer', route.params.listingId)}>
              <Text style={styles.secondaryButtonText}>Make Offer</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </View>
        </View>
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
  imageFrame: {
    aspectRatio: 1.05,
    backgroundColor: colors.brand.emerald900,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: colors.accent.gold200,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    left: spacing[4],
    position: 'absolute',
    top: spacing[4],
  },
  statusBadge: {
    backgroundColor: colors.neutral[0],
    borderColor: colors.brand.emerald100,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  statusBadgeText: {
    color: colors.brand.emerald700,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  auctionBadge: {
    backgroundColor: colors.accent.gold600,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  auctionBadgeText: {
    color: colors.neutral[0],
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  contentCard: {
    ...shadows.card,
    backgroundColor: colors.neutral[0],
    borderColor: colors.brand.emerald100,
    borderRadius: radii.lg,
    borderWidth: 1,
    margin: spacing[4],
    marginTop: -spacing[6],
    padding: spacing[5],
  },
  title: {
    color: colors.neutral[900],
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  priceRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  originalPrice: {
    color: colors.neutral[500],
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  price: {
    color: colors.brand.emerald800,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  stars: {
    color: colors.accent.gold600,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  ratingText: {
    color: colors.neutral[500],
    fontSize: 14,
    fontWeight: '600',
  },
  sellerRow: {
    alignItems: 'center',
    borderColor: colors.neutral[200],
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
    paddingTop: spacing[4],
  },
  sellerLogo: {
    backgroundColor: colors.brand.emerald50,
    borderColor: colors.brand.emerald100,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    width: 40,
  },
  sellerInitial: {
    alignItems: 'center',
    backgroundColor: colors.brand.emerald800,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sellerInitialText: {
    color: colors.accent.gold200,
    fontSize: 16,
    fontWeight: '800',
  },
  sellerName: {
    color: colors.neutral[700],
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  section: {
    marginTop: spacing[5],
  },
  sectionTitle: {
    color: colors.neutral[900],
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing[2],
  },
  description: {
    color: colors.neutral[700],
    fontSize: 15,
    lineHeight: 23,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  infoItem: {
    backgroundColor: colors.brand.emerald50,
    borderColor: colors.brand.emerald100,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing[3],
    width: '48%',
  },
  infoLabel: {
    color: colors.neutral[500],
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.neutral[900],
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing[1],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[6],
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.emerald800,
    borderRadius: radii.md,
    paddingVertical: spacing[3],
  },
  primaryButtonText: {
    color: colors.neutral[0],
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent.gold600,
    borderRadius: radii.md,
    paddingVertical: spacing[3],
  },
  secondaryButtonText: {
    color: colors.brand.emerald950,
    fontSize: 15,
    fontWeight: '800',
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.brand.emerald100,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: spacing[3],
  },
  backButtonText: {
    color: colors.brand.emerald800,
    fontSize: 15,
    fontWeight: '800',
  },
});
