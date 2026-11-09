
import axios from "axios";
import defaultWeatherImage from "../assets/images/default-weather.jpg";

// Wikimedia Commons API
const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const CITY_IMAGE_CACHE_KEY = "smart-weather-city-images";
const CITY_IMAGE_CACHE_LIMIT = 20;
const memoryCache = new Map();
const inFlightRequests = new Map();

// Default fallback image
const getDefaultImage = () => ({
    imageUrl: defaultWeatherImage,
    attribution: null,
    sourceUrl: null,
    licenseUrl: null,
});

// Remove HTML tags from Wikimedia metadata
const cleanMetadata = (value) => {
    if (!value) return "";

    return value.replace(/<[^>]*>/g, "").trim();
};

const normalizeText = (value) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const getCityCacheKey = (cityName) => normalizeText(cityName);

export const getCachedCityBackground = (cityName) => {
    if (!cityName || !cityName.trim()) {
        return null;
    }

    const key = getCityCacheKey(cityName);
    const cached = memoryCache.get(key);
    const cacheDuration = 30 * 24 * 60 * 60 * 1000;

    if (cached && Date.now() - cached.savedAt < cacheDuration) {
        return cached.background;
    }

    try {
        const storedCache = JSON.parse(
            localStorage.getItem(CITY_IMAGE_CACHE_KEY) || "{}"
        );
        const stored = storedCache[key];

        if (stored?.background && Date.now() - stored.savedAt < cacheDuration) {
            memoryCache.set(key, stored);
            return stored.background;
        }
    } catch (error) {
        console.warn("Unable to read cached city images:", error);
    }

    return null;
};

const cacheCityBackground = (cityName, background) => {
    const key = getCityCacheKey(cityName);
    const cached = { savedAt: Date.now(), background };

    memoryCache.set(key, cached);
    if (memoryCache.size > CITY_IMAGE_CACHE_LIMIT) {
        memoryCache.delete(memoryCache.keys().next().value);
    }

    try {
        const storedCache = JSON.parse(
            localStorage.getItem(CITY_IMAGE_CACHE_KEY) || "{}"
        );
        storedCache[key] = cached;

        const recentEntries = Object.entries(storedCache)
            .sort((first, second) => second[1].savedAt - first[1].savedAt)
            .slice(0, CITY_IMAGE_CACHE_LIMIT);

        localStorage.setItem(
            CITY_IMAGE_CACHE_KEY,
            JSON.stringify(Object.fromEntries(recentEntries))
        );
    } catch (error) {
        console.warn("Unable to cache city images:", error);
    }
};

const getImageRelevanceScore = (image, normalizedCityName) => {
    const title = normalizeText(image.title);
    const cityMatch =
        normalizedCityName && title.includes(normalizedCityName);
    const scenicMatch =
        /\b(skyline|landscape|panorama|cityscape|view|waterfront|river)\b/.test(
            title
        );
    const nonPhotoMatch =
        /\b(map|diagram|plan|painting|drawing|engraving|poster|interior|hall|plate|museum)\b/.test(
            title
        );
    const aspectRatio = image.width / image.height;

    return (
        (cityMatch ? 1000 : 0) +
        (scenicMatch ? 100 : 0) -
        (nonPhotoMatch ? 500 : 0) +
        (image.width >= 1200 ? 20 : 0) +
        (aspectRatio >= 1.4 ? 10 : 0)
    );
};

const fetchCityBackground = async (cityName, signal) => {
    if (!cityName || !cityName.trim()) {
        return getDefaultImage();
    }

    try {
        const response = await axios.get(COMMONS_API_URL, {
            params: {
                action: "query",
                generator: "search",
                gsrsearch: `${cityName.trim()} city view`,
                gsrnamespace: 6,
                gsrlimit: 6,
                prop: "imageinfo",
                iiprop: "url|mime|size|extmetadata",
                iiextmetadatafilter:
                    "Artist|Credit|LicenseShortName|LicenseUrl",
                iiurlwidth: 1600,
                format: "json",
                origin: "*",
            },
            signal,
        });

        const pages = Object.values(
            response.data?.query?.pages || {}
        );

        const images = pages
            .map((page) => {
                const imageInfo = page.imageinfo?.[0];

                if (
                    !imageInfo?.thumburl ||
                    !imageInfo.mime?.startsWith("image/") ||
                    imageInfo.mime === "image/svg+xml"
                ) {
                    return null;
                }

                const thumbnailWidth = imageInfo.thumbwidth || imageInfo.width;
                const thumbnailHeight = imageInfo.thumbheight || imageInfo.height;
                if (!thumbnailWidth || !thumbnailHeight) {
                    return null;
                }

                const metadata = imageInfo.extmetadata || {};

                const artist = cleanMetadata(
                    metadata.Artist?.value ||
                    metadata.Credit?.value
                );

                const license = cleanMetadata(
                    metadata.LicenseShortName?.value
                );

                const sourceUrl =
                    "https://commons.wikimedia.org/wiki/" +
                    encodeURIComponent(
                        page.title.replace(/ /g, "_")
                    ).replace(/%3A/g, ":");

                return {
                    title: page.title,
                    imageUrl: imageInfo.thumburl,
                    width: thumbnailWidth,
                    height: thumbnailHeight,
                    attribution: [artist, license]
                        .filter(Boolean)
                        .join(" — "),
                    sourceUrl,
                    licenseUrl: cleanMetadata(
                        metadata.LicenseUrl?.value
                    ),
                };
            })
            .filter(Boolean);

        const normalizedCityName = normalizeText(cityName);
        const cityMatches = normalizedCityName
            ? images.filter((image) =>
                normalizeText(image.title).includes(normalizedCityName)
            )
            : [];
        const candidates = cityMatches.length > 0 ? cityMatches : images;

        const selectedImage = candidates
            .filter(
                (image) =>
                    image.width / image.height >= 1.2 &&
                    image.width >= 1200
            )
            .sort((first, second) => {
                return (
                    getImageRelevanceScore(second, normalizedCityName) -
                    getImageRelevanceScore(first, normalizedCityName)
                );
            })[0] || candidates[0];

        if (!selectedImage) {
            return getDefaultImage();
        }

        const background = {
            imageUrl: selectedImage.imageUrl,
            attribution: selectedImage.attribution,
            sourceUrl: selectedImage.sourceUrl,
            licenseUrl: selectedImage.licenseUrl,
        };

        cacheCityBackground(cityName, background);
        return background;
    } catch (error) {
        if (axios.isCancel(error) || signal?.aborted) {
            throw error;
        }

        console.error("City Image API Error:", error);
        return getDefaultImage();
    }
};

// Reuse cached and in-flight lookups so selecting a search result does not
// start another request if its image was already warmed from the result list.
export const getCityBackground = (cityName, signal) => {
    if (!cityName || !cityName.trim()) {
        return Promise.resolve(getDefaultImage());
    }

    const key = getCityCacheKey(cityName);
    const cachedBackground = getCachedCityBackground(cityName);
    if (cachedBackground) {
        return Promise.resolve(cachedBackground);
    }

    const pendingRequest = inFlightRequests.get(key);
    if (pendingRequest) {
        return pendingRequest;
    }

    const request = fetchCityBackground(cityName, signal).finally(() => {
        if (inFlightRequests.get(key) === request) {
            inFlightRequests.delete(key);
        }
    });

    inFlightRequests.set(key, request);
    return request;
};
