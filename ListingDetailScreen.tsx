import { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fetchListingDetail } from '../services/api/marketplace';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ListingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ListingDetail'>;

type ListingRecord = Record<string, unknown>;

type ListingMediaItem = {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
};

type RatingRecord = {
  average?: number | string | null;
  avg?: number | string | null;
  count?: number | string | null;
};

type PriceRecord = {
  formatted?: number | string | null;
  amount?: number | string | null;
  currency?: string | null;
};

type ReviewsRecord = {
  summary?: unknown;
};

declare const __DEV__: boolean | undefined;

const isRecord = (value: unknown): value is ListingRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const getOptimizedImageUrl = (url?: string | null, width = 900): string | null => {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&q=75`;
};


const getString = (listing: ListingRecord, keys: string[]) => {
  for (const key of keys) {
    const value = listing[key];

    if (hasText(value)) {
      return value.trim();
    }
  }

  return null;
};

const getDisplayString = (listing: ListingRecord, keys: string[]) => {
  for (const key of keys) {
    const value = listing[key];

    if (hasText(value)) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
};

const getNestedString = (listing: ListingRecord, path: string[]) => {
  let value: unknown = listing;

  for (const key of path) {
    if (!isRecord(value)) {
      return null;
    }

    value = value[key];
  }

  return hasText(value) ? value.trim() : null;
};

const getFarmName = (listing: ListingRecord) =>
  getNestedString(listing, ['seller', 'farm_name']) ??
  getNestedString(listing, ['seller', 'shop_name']) ??
  getNestedString(listing, ['seller', 'store_name']) ??
  getNestedString(listing, ['seller', 'business_name']) ??
  getNestedString(listing, ['seller', 'name']) ??
  getNestedString(listing, ['seller', 'display_name']) ??
  getString(listing, [
    'farmName',
    'sellerFarmName',
    'shopName',
    'storeName',
    'farm_name',
    'shop_name',
    'store_name',
    'business_name',
    'seller_farm_name',
    'seller_shop_name',
    'seller_store_name',
    'seller_business_name',
  ]);


const cleanMediaUrl = (url: unknown): string | null => {
  if (!hasText(url)) {
    return null;
  }

  const trimmedUrl = url.trim();
  return trimmedUrl.length > 0 ? trimmedUrl : null;
};

const isVideoUrl = (url: unknown): boolean => {
  const mediaUrl = cleanMediaUrl(url);

  if (!mediaUrl) {
    return false;
  }

  return /\.(m3u8|mov|mp4|m4v|webm)(?:[?#].*)?$/i.test(mediaUrl);
};

const getMediaString = (value: unknown, keys: string[]): string | null => {
  if (hasText(value)) {
    return cleanMediaUrl(value);
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of keys) {
    const mediaUrl = cleanMediaUrl(value[key]);

    if (mediaUrl) {
      return mediaUrl;
    }
  }

  return null;
};

const collectMediaValues = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (hasText(value) || isRecord(value)) {
    return [value];
  }

  return [];
};

const normalizeMediaCandidate = (value: unknown, fallbackType: ListingMediaItem['type']): ListingMediaItem | null => {
  const url = getMediaString(value, ['url', 'uri', 'src', 'image', 'image_url', 'photo', 'photo_url', 'video', 'video_url', 'clip_url']);

  if (!url) {
    return null;
  }

  const mediaType = isRecord(value)
    ? getMediaString(value, ['type', 'media_type', 'mime_type', 'content_type'])
    : null;
  const thumbnail = getMediaString(value, ['thumbnail', 'thumbnail_url', 'thumb', 'thumb_url', 'poster', 'poster_url']) ?? undefined;
  const type = mediaType?.toLowerCase().includes('video') || isVideoUrl(url) ? 'video' : fallbackType;

  return { type, url, thumbnail };
};

const normalizeListingMedia = (listing: ListingRecord): ListingMediaItem[] => {
  const mediaItems: ListingMediaItem[] = [];
  const seenUrls = new Set<string>();

  const addMediaItem = (item: ListingMediaItem | null) => {
    if (!item) {
      return;
    }

    const cleanedUrl = cleanMediaUrl(item.url);

    if (!cleanedUrl || seenUrls.has(cleanedUrl)) {
      return;
    }

    seenUrls.add(cleanedUrl);
    mediaItems.push({ ...item, url: cleanedUrl });
  };

  const imageKeys = ['coverImage', 'imageUrl', 'image_url', 'cover_image', 'cover_image_url', 'images', 'photos', 'gallery', 'image_urls'];
  const mixedMediaKeys = ['media'];
  const videoKeys = ['video_url', 'video', 'clip_url', 'videos'];

  imageKeys.forEach((key) => {
    collectMediaValues(listing[key]).forEach((value) => addMediaItem(normalizeMediaCandidate(value, 'image')));
  });

  mixedMediaKeys.forEach((key) => {
    collectMediaValues(listing[key]).forEach((value) => addMediaItem(normalizeMediaCandidate(value, isVideoUrl(value) ? 'video' : 'image')));
  });

  videoKeys.forEach((key) => {
    collectMediaValues(listing[key]).forEach((value) => addMediaItem(normalizeMediaCandidate(value, 'video')));
  });

  return mediaItems;
};

const getFarmLogo = (listing: ListingRecord) =>
  getNestedString(listing, ['seller', 'farm_logo']) ??
  getNestedString(listing, ['seller', 'farm_logo_path']) ??
  getNestedString(listing, ['seller', 'shop_logo']) ??
  getNestedString(listing, ['seller', 'store_logo']) ??
  getNestedString(listing, ['seller', 'business_logo']) ??
  getNestedString(listing, ['seller', 'logo']) ??
  getNestedString(listing, ['seller', 'logo_url']) ??
  getNestedString(listing, ['seller', 'avatar_url']) ??
  getString(listing, [
    'farmLogo',
    'sellerFarmLogo',
    'shopLogo',
    'storeLogo',
    'farm_logo',
    'farm_logo_path',
    'shop_logo',
    'store_logo',
    'business_logo',
    'seller_farm_logo',
    'seller_farm_logo_path',
    'seller_shop_logo',
    'seller_store_logo',
    'logo_url',
  ]);




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

  const price = listing.price;

  if (isRecord(price)) {
    const priceRecord = price as PriceRecord;

    if (typeof priceRecord.amount === 'number') {
      return priceRecord.amount;
    }

    if (hasText(priceRecord.amount)) {
      return priceRecord.amount.trim();
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
  const price = listing.price;
  const priceRecord = isRecord(price) ? (price as PriceRecord) : null;
  const formattedPriceValue = priceRecord?.formatted;
  const formattedPrice = getString(listing, ['priceFormatted', 'price_formatted']) ??
    (hasText(formattedPriceValue) ? formattedPriceValue.trim() : null);

  if (formattedPrice !== null && formattedPrice !== 'Price unavailable') {
    return formattedPrice;
  }

  const rawPrice = getRawPriceValue(listing, [
    'priceAmount',
    'price_amount',
    'finalPrice',
    'final_price',
    'price',
  ]);

  if (isUnavailablePrice(rawPrice)) {
    return 'Contact for price';
  }

  if (typeof rawPrice === 'number' || typeof rawPrice === 'string') {
    return formatPrice(rawPrice, currency);
  }

  return 'Contact for price';
};



export function ListingDetailScreen({ navigation, route }: ListingDetailScreenProps) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [failedMediaUrls, setFailedMediaUrls] = useState<Record<string, boolean>>({});
  const [fullListing, setFullListing] = useState<ListingRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const fallbackListing: ListingRecord = useMemo(
    () => (isRecord(route.params.listing) ? route.params.listing : {}),
    [route.params.listing],
  );
  const listing: ListingRecord = useMemo(
    () => ({ ...fallbackListing, ...(fullListing ?? {}) }),
    [fallbackListing, fullListing],
  );
  const listingId = route.params.listingId;

  useEffect(() => {
    const controller = new AbortController();

    setFullListing(null);
    setLoadingDetail(true);
    setDetailError(null);

    fetchListingDetail(listingId, controller.signal)
      .then((detail: ListingRecord) => {
        setFullListing(detail);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setDetailError(error instanceof Error ? error.message : 'Unable to load listing detail.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false);
        }
      });

    return () => controller.abort();
  }, [listingId]);

  const mediaItems: ListingMediaItem[] = useMemo(() => normalizeListingMedia(listing), [listing]);
  const mediaKey = mediaItems.map((item: ListingMediaItem) => item.url).join('|');
  const selectedMedia = mediaItems[selectedMediaIndex] ?? mediaItems[0];
  const selectedMediaFailed = selectedMedia ? failedMediaUrls[selectedMedia.url] : false;

  useEffect(() => {
    setSelectedMediaIndex(0);
    setFailedMediaUrls({});
  }, [mediaKey]);

  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('Listing detail media keys', {
        listingId,
        images: listing.images,
        media: listing.media,
        videos: listing.videos,
        video_url: listing.video_url,
        clip_url: listing.clip_url,
      });
    }
  }, [listing, listingId]);


  const title = getString(listing, ['title', 'name']) ?? `Listing #${listingId}`;
  const priceRecord = isRecord(listing.price) ? (listing.price as PriceRecord) : null;
  const priceCurrency = priceRecord?.currency;
  const currency =
    getString(listing, ['priceCurrency', 'currency', 'price_currency']) ??
    (hasText(priceCurrency) ? priceCurrency.trim() : 'USD');
  const description =
    getString(listing, ['shortDescription', 'short_description', 'description']) ?? 'No description available yet.';
  const isAuction = getBoolean(listing, ['auctionEnabled', 'auction_enabled', 'isAuction', 'is_auction']);
  const saleStatus = getString(listing, ['saleStatus', 'sale_status', 'status']) ?? 'available';
  const ratingValue = listing.rating;
  const ratingRecord = isRecord(ratingValue) ? (ratingValue as RatingRecord) : null;
  const reviewsRecord = isRecord(listing.reviews) ? (listing.reviews as ReviewsRecord) : null;
  const reviewSummary = isRecord(reviewsRecord?.summary) ? (reviewsRecord.summary as RatingRecord) : null;
  const ratingAverage =
    getNumber(listing, ['avgRating', 'avg_rating', 'reviewAverage', 'review_average']) ??
    toNumber(ratingRecord?.average ?? ratingRecord?.avg ?? reviewSummary?.average ?? reviewSummary?.avg ?? ratingValue);
  const reviewCount =
    getNumber(listing, ['reviewCount', 'review_count', 'reviews_count']) ??
    toNumber(ratingRecord?.count ?? reviewSummary?.count);
  const originalPriceValue = getNumber(listing, ['originalPrice', 'original_price']);
  const discountedPriceValue = getNumber(listing, ['discountedPrice', 'discounted_price', 'finalPrice', 'final_price']);
  const hasDiscount =
    originalPriceValue !== null && discountedPriceValue !== null && originalPriceValue > discountedPriceValue;
  const currentPrice = formatListingPrice(listing, currency);
  const originalPrice = hasDiscount ? formatPrice(originalPriceValue, currency) : null;
  const farmName = getFarmName(listing);
  const farmLogo = getFarmLogo(listing);
  const basicInfo = [
    ['Species', getDisplayString(listing, ['species'])],
    ['Strain', getDisplayString(listing, ['strain'])],
    ['Gender', getDisplayString(listing, ['gender', 'sex'])],
    ['Size', getDisplayString(listing, ['size'])],
    ['Age', getDisplayString(listing, ['age', 'age_months'])],
  ].filter((item): item is [string, string] => hasText(item[1]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
        <View style={styles.imageFrame}>
         {selectedMedia?.type === 'image' && !selectedMediaFailed ? (
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
             resizeMethod="resize"
              fadeDuration={150}
            source={{ uri: getOptimizedImageUrl(selectedMedia.url, 1000) ?? selectedMedia.url }}
              style={styles.image}
            onError={() => setFailedMediaUrls((current: Record<string, boolean>) => ({ ...current, [selectedMedia.url]: true }))}
            />
  ) : selectedMedia?.type === 'video' ? (
            <View style={styles.videoPreview}>
              {hasText(selectedMedia.thumbnail) ? (
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="cover"
                  resizeMethod="resize"
                  source={{ uri: getOptimizedImageUrl(selectedMedia.thumbnail, 1000) ?? selectedMedia.thumbnail }}
                  style={styles.videoThumbnail}
                />
              ) : null}
              <View style={styles.videoOverlay}>
                <Text style={styles.videoLabel}>Video Clip</Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.videoButton}
                  onPress={() => Linking.openURL(selectedMedia.url)}
                >
                  <Text style={styles.videoButtonText}>Play / Open</Text>
                </Pressable>
              </View>
            </View>
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

        {mediaItems.length > 1 ? (
          <ScrollView
            contentContainerStyle={styles.thumbnailContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroller}
          >
            {mediaItems.map((item: ListingMediaItem, index: number) => {
              const thumbnailUrl = item.thumbnail ?? item.url;
              const isSelected = item.url === selectedMedia?.url;

              return (
                <Pressable
                  accessibilityLabel={`${item.type === 'video' ? 'Video Clip' : 'Listing image'} ${index + 1}`}
                  accessibilityRole="button"
                  key={`${item.type}-${item.url}`}
                  onPress={() => setSelectedMediaIndex(index)}
                  style={[styles.thumbnailButton, isSelected ? styles.thumbnailButtonSelected : null]}
                >
                  {item.type === 'image' || hasText(item.thumbnail) ? (
                    <Image
                      accessibilityIgnoresInvertColors
                      resizeMode="cover"
                      resizeMethod="resize"
                      source={{ uri: getOptimizedImageUrl(thumbnailUrl, 240) ?? thumbnailUrl }}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <View style={styles.thumbnailVideoFallback}>
                      <Text style={styles.thumbnailVideoIcon}>▶</Text>
                    </View>
                  )}
                  {item.type === 'video' ? (
                    <View style={styles.thumbnailVideoBadge}>
                      <Text style={styles.thumbnailVideoBadgeText}>Video Clip</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}


        {loadingDetail ? <Text style={styles.detailStatusText}>Loading full listing details…</Text> : null}
        {detailError ? <Text style={styles.detailErrorText}>{detailError}</Text> : null}

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

         {hasText(farmName) ? (
            <View style={styles.sellerRow}>
              {hasText(farmLogo) ? (
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="cover"
                  source={{ uri: farmLogo }}
                  style={styles.sellerLogo}
                />
              ) : (
                <View style={styles.sellerInitial}>
                  <Text style={styles.sellerInitialText}>{farmName.trim().charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <Text numberOfLines={1} style={styles.sellerName}>
                {farmName.trim()}
              </Text>
            </View>
          ) : null}


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
            <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => console.log('Add to Cart', listingId)}>
              <Text style={styles.primaryButtonText}>Add to Cart</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => console.log('Make Offer', listingId)}>
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


  videoPreview: {
    backgroundColor: colors.brand.emerald950,
    flex: 1,
  },
  videoThumbnail: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 34, 0.5)',
    justifyContent: 'center',
    padding: spacing[5],
  },
  videoLabel: {
    color: colors.neutral[0],
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing[3],
  },
  videoButton: {
    backgroundColor: colors.accent.gold600,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  videoButtonText: {
    color: colors.brand.emerald950,
    fontSize: 15,
    fontWeight: '800',
  },
  thumbnailScroller: {
    backgroundColor: colors.neutral[0],
    borderBottomColor: colors.brand.emerald100,
    borderBottomWidth: 1,
  },
  thumbnailContent: {
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  thumbnailButton: {
    backgroundColor: colors.brand.emerald50,
    borderColor: colors.brand.emerald100,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 74,
    overflow: 'hidden',
    width: 74,
  },
  thumbnailButtonSelected: {
    borderColor: colors.accent.gold600,
    borderWidth: 2,
  },
  thumbnailImage: {
    height: '100%',
    width: '100%',
  },
  thumbnailVideoFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  thumbnailVideoIcon: {
    color: colors.brand.emerald800,
    fontSize: 24,
    fontWeight: '800',
  },
  thumbnailVideoBadge: {
    backgroundColor: 'rgba(2, 44, 34, 0.78)',
    bottom: 0,
    left: 0,
    paddingVertical: 2,
    position: 'absolute',
    right: 0,
  },
  thumbnailVideoBadgeText: {
    color: colors.neutral[0],
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
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
  detailStatusText: {
    color: colors.neutral[500],
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
  },
  detailErrorText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
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

