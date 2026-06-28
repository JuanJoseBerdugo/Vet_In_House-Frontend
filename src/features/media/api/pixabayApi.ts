import { env } from "../../../config/env";

export type PetVideo = {
  id: number;
  pageUrl: string;
  tags: string;
  duration: number;
  videoUrl: string;
};

export type PetShopImage = {
  id: number;
  pageUrl: string;
  tags: string;
  imageUrl: string;
  previewUrl: string;
};

type PixabayVideoHit = {
  id: number;
  pageURL: string;
  tags: string;
  duration: number;
  videos: {
    medium?: {
      url: string;
    };
    large?: {
      url: string;
    };
    small?: {
      url: string;
    };
  };
};

type PixabayVideoResponse = {
  hits: PixabayVideoHit[];
};

type PixabayImageHit = {
  id: number;
  pageURL: string;
  tags: string;
  webformatURL: string;
  previewURL: string;
};

type PixabayImageResponse = {
  hits: PixabayImageHit[];
};

const CACHE_KEY = "vet_in_house_pixabay_pet_videos";
const SHOP_CACHE_KEY = "vet_in_house_pixabay_petshop_images";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CachedVideos = {
  savedAt: number;
  videos: PetVideo[];
};

type CachedShopImages = {
  savedAt: number;
  images: PetShopImage[];
};

export async function getPetVideos(): Promise<PetVideo[]> {
  const cached = getCachedVideos();
  if (cached.length > 0) return cached;

  const key = env.pixabayApiKey.trim();
  if (!key) return [];

  const params = new URLSearchParams({
    key,
    q: "dogs cats pets",
    category: "animals",
    video_type: "film",
    safesearch: "true",
    per_page: "20",
    min_width: "1280",
  });

  const response = await fetch(`https://pixabay.com/api/videos/?${params.toString()}`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar los videos de Pixabay");
  }

  const payload = (await response.json()) as PixabayVideoResponse;
  const videos = payload.hits
    .map((hit) => ({
      id: hit.id,
      pageUrl: hit.pageURL,
      tags: hit.tags,
      duration: hit.duration,
      videoUrl: hit.videos.medium?.url ?? hit.videos.large?.url ?? hit.videos.small?.url ?? "",
    }))
    .filter((video) => video.videoUrl.length > 0);

  saveCachedVideos(videos);
  return videos;
}

export async function getPetShopImages(): Promise<PetShopImage[]> {
  const cached = getCachedShopImages();
  if (cached.length > 0) return cached;

  const key = env.pixabayApiKey.trim();
  if (!key) return [];

  const params = new URLSearchParams({
    key,
    q: "pet shop dog cat food toys grooming",
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    per_page: "18",
  });

  const response = await fetch(`https://pixabay.com/api/?${params.toString()}`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar imagenes de Pixabay");
  }

  const payload = (await response.json()) as PixabayImageResponse;
  const images = payload.hits
    .map((hit) => ({
      id: hit.id,
      pageUrl: hit.pageURL,
      tags: hit.tags,
      imageUrl: hit.webformatURL,
      previewUrl: hit.previewURL,
    }))
    .filter((image) => image.imageUrl.length > 0);

  saveCachedShopImages(images);
  return images;
}

function getCachedVideos(): PetVideo[] {
  const raw = window.localStorage.getItem(CACHE_KEY);
  if (!raw) return [];

  try {
    const cached = JSON.parse(raw) as CachedVideos;
    if (Date.now() - cached.savedAt > CACHE_TTL_MS) return [];
    return cached.videos;
  } catch {
    window.localStorage.removeItem(CACHE_KEY);
    return [];
  }
}

function saveCachedVideos(videos: PetVideo[]) {
  window.localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      savedAt: Date.now(),
      videos,
    } satisfies CachedVideos),
  );
}

function getCachedShopImages(): PetShopImage[] {
  const raw = window.localStorage.getItem(SHOP_CACHE_KEY);
  if (!raw) return [];

  try {
    const cached = JSON.parse(raw) as CachedShopImages;
    if (Date.now() - cached.savedAt > CACHE_TTL_MS) return [];
    return cached.images;
  } catch {
    window.localStorage.removeItem(SHOP_CACHE_KEY);
    return [];
  }
}

function saveCachedShopImages(images: PetShopImage[]) {
  window.localStorage.setItem(
    SHOP_CACHE_KEY,
    JSON.stringify({
      savedAt: Date.now(),
      images,
    } satisfies CachedShopImages),
  );
}
