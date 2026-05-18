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
  farm_name?: Nullable<string>;
  shop_name?: Nullable<string>;
  store_name?: Nullable<string>;
  business_name?: Nullable<string>;
  display_name?: Nullable<string>;
  logo?: Nullable<string>;
  farm_logo?: Nullable<string>;
   farm_logo_path?: Nullable<string>; 
  shop_logo?: Nullable<string>;
  store_logo?: Nullable<string>;
  business_logo?: Nullable<string>;  
  logo_url?: Nullable<string>;
  avatar_url?: Nullable<string>;
};

type RawListingMedia = {
  url?: Nullable<string>;
  src?: Nullable<string>;
  storage_path?: Nullable<string>;
  file_name?: Nullable<string>;
  image_path?: Nullable<string>;
  image_url?: Nullable<string>;
  path?: Nullable<string>;
  full_path?: Nullable<string>;
  public_url?: Nullable<string>;
};

type RawListingImage = {
  url?: Nullable<string>;
  src?: Nullable<string>;
  storage_path?: Nullable<string>;
  file_name?: Nullable<string>;
  image_path?: Nullable<string>;
  image_url?: Nullable<string>;
  path?: Nullable<string>;
  full_path?: Nullable<string>;
  public_url?: Nullable<string>;
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
  coverImage?: Nullable<string>;
  cover_image?: Nullable<string>;
  cover_image_url?: Nullable<string>;
  imageUrl?: Nullable<string>;
  image_url?: Nullable<string>;
  image?: Nullable<string>;
  thumbnail?: Nullable<string>;
  thumbnail_url?: Nullable<string>;
  photo?: Nullable<string>;
  photo_url?: Nullable<string>;
  media?: Nullable<RawListingMedia[]>;
  images?: Nullable<RawListingImage[]>;
  listing_media?: Nullable<RawListingMedia[]>;
  price?: Nullable<RawPrice>;
  status?: Nullable<string>;
  sale_status?: Nullable<string>;
  species?: Nullable<string>;
  strain?: Nullable<string>;
  grade?: Nullable<string>;
  country?: Nullable<string>;
  city?: Nullable<string>;
  farm_name?: Nullable<string>;
  shop_name?: Nullable<string>;
  store_name?: Nullable<string>;
  business_name?: Nullable<string>;
  seller_farm_name?: Nullable<string>;
  seller_shop_name?: Nullable<string>;
  seller_store_name?: Nullable<string>;
   seller_business_name?: Nullable<string>; 
  seller_logo?: Nullable<string>;
  farm_logo?: Nullable<string>;
  farm_logo_path?: Nullable<string>;  
  shop_logo?: Nullable<string>;
  store_logo?: Nullable<string>;
  business_logo?: Nullable<string>;
  seller_farm_logo?: Nullable<string>;
  seller_farm_logo_path?: Nullable<string>;
  seller_shop_logo?: Nullable<string>;
  seller_store_logo?: Nullable<string>;
  logo_url?: Nullable<string>;
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
   imageUrl: string | null;
  image_url: string | null;
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
   sellerLogo: string | null;
  farmName?: string | null;
  farmLogo?: string | null;
  sellerFarmName?: string | null;
  sellerFarmLogo?: string | null;
  shopName?: string | null;
  shopLogo?: string | null;
  storeName?: string | null;
  storeLogo?: string | null;
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

 const normalizedValue = rawValue.replace(/\\+/g, '/');

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }
  

  if (normalizedValue.startsWith('//')) {
    return `https:${normalizedValue}`;
  }

 if (normalizedValue.startsWith('/')) {
    return `${MARKETPLACE_ORIGIN}${normalizedValue}`;
  }

  return `${MARKETPLACE_ORIGIN}/${normalizedValue}`;
};

const pickListingFileNameCandidate = (
  listingId: Nullable<string | number>,
  fileName: Nullable<string | number>,
): Nullable<string | number> => {
  const normalizedFileName = toTrimmedString(fileName)?.replace(/\\+/g, '/');

  if (normalizedFileName === undefined || normalizedFileName === null) {
    return fileName;
  }

  if (normalizedFileName.includes('/')) {
    return fileName;
  }

  const normalizedListingId = toTrimmedString(listingId);

  if (normalizedListingId === null) {
    return fileName;
  }

  return `${MARKETPLACE_ORIGIN}/uploads/listings/${encodeURIComponent(
    normalizedListingId,
  )}/${encodeURIComponent(normalizedFileName)}`;
};

const collectMediaCandidates = (
  records: Nullable<Array<RawListingMedia | RawListingImage>>,
   listingId: Nullable<string | number>,
): Array<Nullable<string | number>> => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.slice(0, 5).flatMap((record) => [
    record.url,
    record.src,
    record.storage_path,
 pickListingFileNameCandidate(listingId, record.file_name), 
    record.image_path,
    record.image_url,
    record.path,
    record.full_path,
    record.public_url,
  ]);
};

const pickListingImage = (item: RawMarketplaceListing): string | null => {
  const candidates: Array<Nullable<string | number>> = [
    item.coverImage,
    item.cover_image,
    item.cover_image_url,
    item.imageUrl,
    item.image_url,
    item.image,
    item.thumbnail,
    item.thumbnail_url,
    item.photo,
    item.photo_url,
  ...collectMediaCandidates(item.media, item.id),
    ...collectMediaCandidates(item.images, item.id),
    ...collectMediaCandidates(item.listing_media, item.id),
  ];

  for (const candidate of candidates) {
    const normalizedImage = normalizeAssetUrl(candidate);

    if (normalizedImage !== null) {
      return normalizedImage;
    }
  }

  return null;
};


const pickFarmName = (item: RawMarketplaceListing): string | null => {
  const candidates: Array<Nullable<string | number>> = [
    item.seller?.farm_name,
    item.seller?.shop_name,
    item.seller?.store_name,
    item.seller?.business_name,
    item.farm_name,
    item.shop_name,
    item.store_name,
    item.business_name,
    item.seller_farm_name,
    item.seller_shop_name,
    item.seller_store_name,

    item.seller_business_name, 
  ];

  for (const candidate of candidates) {
    const farmName = toTrimmedString(candidate);

    if (farmName !== null) {
      return farmName;
    }
  }

 
  return null;
};

const pickFarmLogo = (item: RawMarketplaceListing): string | null => {
  const candidates: Array<Nullable<string | number>> = [
    item.seller?.farm_logo,
    item.seller?.farm_logo_path,	
    item.seller?.shop_logo,
    item.seller?.store_logo,
  item.seller?.business_logo,
    item.farm_logo,
   item.farm_logo_path,	
    item.shop_logo,
    item.store_logo,
   item.business_logo,
    item.seller_farm_logo,
    item.seller_farm_logo_path,
    item.seller_shop_logo,
    item.seller_store_logo,
    item.logo_url,

  ];

  for (const candidate of candidates) {
   const farmLogo = normalizeAssetUrl(candidate);

   if (farmLogo !== null) {
      return farmLogo;
    }
  }

  return null;
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
  const pickedImage = pickListingImage(item);
  
  
  if (!pickedImage) {
  console.log(
    '[IMAGE_MISSING]',
    JSON.stringify(
      {
        id: item?.id,
        title: item?.title,
        cover_image: item?.cover_image,
        cover_image_url: item?.cover_image_url,
        image_url: item?.image_url,
        image: item?.image,
        thumbnail: item?.thumbnail,
        photo: item?.photo,
        media: item?.media,
        images: item?.images,
        listing_media: item?.listing_media,
      },
      null,
      2
    )
  );
}
  
  if (pickedImage === null) {
    console.log('Marketplace listing missing coverImage', {
      id: item.id,
      title: item.title,
      cover_image: item.cover_image,
      cover_image_url: item.cover_image_url,
      image_url: item.image_url,
      image: item.image,
      thumbnail: item.thumbnail,
      photo: item.photo,
      media: item.media,
      images: item.images,
      listing_media: item.listing_media,
    });
  }
  
    const farmName = pickFarmName(item);
  const farmLogo = pickFarmLogo(item);
  
  return {
     ...item, 
    id,
    title: toTrimmedString(item.title) ?? 'Untitled Betta Listing',
    slug: toTrimmedString(item.slug),
    url: toTrimmedString(item.url),
     coverImage: pickedImage,
    imageUrl: pickedImage,
    image_url: pickedImage,
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
  sellerName: null,
    sellerLogo: farmLogo,
    farmName,
    farmLogo,
    sellerFarmName: farmName,
    sellerFarmLogo: farmLogo,
    shopName: farmName,
    shopLogo: farmLogo,
    storeName: farmName,
    storeLogo: farmLogo,
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
