const MARKETPLACE_ORIGIN = 'https://bettavaro.com';
const MARKETPLACE_LISTINGS_URL = `${MARKETPLACE_ORIGIN}/api/mobile/v1/listings.php`;

type Nullable<T> = T | null | undefined;

type RawPrice = {
  formatted?: Nullable<string>;
  amount?: Nullable<string | number>;
  currency?: Nullable<string>;
};

type RawSeller = {
  name?: Nullable<string>;
};

type RawRating = {
  average?: Nullable<string | number>;
  count?: Nullable<string | number>;
};

type RawMarketplaceListing = {
  id?: Nullable<string | number>;
  title?: Nullable<string>;
  slug?: Nullable<string>;
  url?: Nullable<string>;
  cover_image?: Nullable<string>;
  price?: Nullable<RawPrice>;
  status?: Nullable<string>;
  sale_status?: Nullable<string>;
  species?: Nullable<string>;
  strain?: Nullable<string>;
  grade?: Nullable<string>;
  country?: Nullable<string>;
  city?: Nullable<string>;
  seller?: Nullable<RawSeller>;
  rating?: Nullable<RawRating>;
  ranking_score?: Nullable<string | number>;
};

type MarketplaceListingsEnvelope = {
  data?: Nullable<{
    items?: Nullable<RawMarketplaceListing[]>;
  }>;
};

type MarketplaceListingsEnvelopeWithItems = {
  data: {
    items: RawMarketplaceListing[];
  };
};

export type MarketplaceListing = {
  id: string;
  title: string;
  slug: string | null;
  url: string | null;
  coverImage: string | null;
  priceFormatted: string;
  priceAmount: number | null;
  priceCurrency: string | null;
  status: string;
  saleStatus: string;
  species: string | null;
  strain: string | null;
  grade: string | null;
  country: string | null;
  city: string | null;
  sellerName: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  rankingScore: number;
};

const toTrimmedString = (value: Nullable<string | number>): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const nextValue = String(value).trim();
  return nextValue.length > 0 ? nextValue : null;
};

const normalizeAssetUrl = (value: Nullable<string | number>): string | null => {
  const rawValue = toTrimmedString(value);

  if (rawValue === null) {
    return null;
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  if (rawValue.startsWith('//')) {
    return `https:${rawValue}`;
  }

  return `${MARKETPLACE_ORIGIN}/${rawValue.replace(/^\/+/, '')}`;
};

const toNumber = (value: Nullable<string | number>): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

const toCount = (value: Nullable<string | number>): number => {
  const nextValue = toNumber(value);
  return nextValue === null ? 0 : Math.max(0, Math.trunc(nextValue));
};

const mapListing = (item: RawMarketplaceListing, index: number): MarketplaceListing => {
  const id = toTrimmedString(item.id) ?? `listing-${index}`;
  const price: RawPrice = item.price ?? {};

  return {
    id,
    title: toTrimmedString(item.title) ?? 'Untitled Betta Listing',
    slug: toTrimmedString(item.slug),
    url: toTrimmedString(item.url),
    coverImage: normalizeAssetUrl(item.cover_image),
    priceFormatted: toTrimmedString(price.formatted) ?? 'Price unavailable',
    priceAmount: toNumber(price.amount),
    priceCurrency: toTrimmedString(price.currency),
    status: toTrimmedString(item.status) ?? 'available',
    saleStatus: toTrimmedString(item.sale_status) ?? 'available',
    species: toTrimmedString(item.species),
    strain: toTrimmedString(item.strain),
    grade: toTrimmedString(item.grade),
    country: toTrimmedString(item.country),
    city: toTrimmedString(item.city),
    sellerName: toTrimmedString(item.seller?.name),
    ratingAverage: toNumber(item.rating?.average),
    ratingCount: toCount(item.rating?.count),
    rankingScore: toNumber(item.ranking_score) ?? 0,
  };
};

const isListingsEnvelopeWithItems = (value: unknown): value is MarketplaceListingsEnvelopeWithItems => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const maybeEnvelope = value as MarketplaceListingsEnvelope;
  return Array.isArray(maybeEnvelope.data?.items);
};

export const fetchMarketplaceListings = async (signal?: AbortSignal): Promise<MarketplaceListing[]> => {
  const response = await fetch(MARKETPLACE_LISTINGS_URL, { signal });

  if (!response.ok) {
    throw new Error('Unable to load marketplace listings.');
  }

  const payload: unknown = await response.json();

  if (!isListingsEnvelopeWithItems(payload)) {
    throw new Error('Marketplace response did not include listings.');
  }

  return payload.data.items.map(mapListing);
};
