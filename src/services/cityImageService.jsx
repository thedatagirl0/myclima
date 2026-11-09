
import axios from "axios";
import defaultWeatherImage from "../assets/images/default-weather.jpg";

// Wikimedia Commons API
const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";

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

// Retrieve a background image for a city
export const getCityBackground = async (cityName) => {
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
                gsrlimit: 10,
                prop: "imageinfo",
                iiprop: "url|extmetadata",
                iiextmetadatafilter:
                    "Artist|Credit|LicenseShortName|LicenseUrl",
                iiurlwidth: 1920,
                format: "json",
                origin: "*",
            },
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
                    imageUrl: imageInfo.thumburl,
                    width: imageInfo.width,
                    height: imageInfo.height,
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

        const selectedImage =
            images.find(
                (image) =>
                    image.width >= 1200 &&
                    image.height > 0 &&
                    image.width / image.height >= 1.4
            ) ||
            images.find(
                (image) =>
                    image.height > 0 &&
                    image.width / image.height >= 1.2
            ) ||
            images[0];

        if (!selectedImage) {
            return getDefaultImage();
        }

        return {
            imageUrl: selectedImage.imageUrl,
            attribution: selectedImage.attribution,
            sourceUrl: selectedImage.sourceUrl,
            licenseUrl: selectedImage.licenseUrl,
        };

    } catch (error) {
        console.error("City Image API Error:", error);
        return getDefaultImage();
    }
};
