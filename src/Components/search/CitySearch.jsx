import React, { useState } from "react";
import axios from "axios";

const GEOCODING_API_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

// Fallback geocoding source used only when Open-Meteo (with language
// fallback and typo variants) finds nothing at all. Nominatim indexes
// OpenStreetMap place names directly, which sometimes catches local
// Arabic/French spellings Open-Meteo's GeoNames-based index misses.
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

const ARABIC_CHARACTERS = /[\u0600-\u06FF]/;
const FRENCH_CHARACTERS = /[àâäçéèêëîïôöùûüÿæœÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ]/;

// Caps on how much work a single search can do, so one typo-filled or
// multilingual query can't fire dozens of sequential network requests.
const MAX_SEARCH_VARIANTS = 6;
const MAX_VARIANT_REQUEST_CONCURRENCY = 3;
const MAX_RESULTS_SHOWN = 5;

// When the detected language's lookup comes back empty, retry with
// these languages in order before falling back to typo/transliteration
// search. Covers cases like a French city typed while Open-Meteo only
// has it indexed under its English or Arabic name, and vice versa.
const LANGUAGE_FALLBACK_ORDER = {
    ar: ["ar", "en", "fr"],
    fr: ["fr", "en"],
    en: ["en", "fr"],
};

const normalizeText = (value = "") =>
    value
        .normalize("NFKD")
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

const detectLanguage = (value) => {
    if (ARABIC_CHARACTERS.test(value)) {
        return "ar";
    }

    if (FRENCH_CHARACTERS.test(value)) {
        return "fr";
    }

    return "en";
};

// Rough Arabic-to-Latin transliteration for common place-name letters.
// Not linguistically exact, but close enough to generate a Latin
// variant ("dar al bayda" from "الدار البيضاء") that a Latin-indexed
// geocoding source can match against.
const ARABIC_TO_LATIN_MAP = {
    "ا": "a", "أ": "a", "إ": "a", "آ": "a", "ى": "a", "ة": "a",
    "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
    "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
    "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh",
    "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
    "ه": "h", "و": "w", "ي": "y", "ء": "",
};

const transliterateArabic = (value = "") => {
    if (!ARABIC_CHARACTERS.test(value)) {
        return "";
    }

    const transliterated = Array.from(normalizeText(value))
        .map((character) => ARABIC_TO_LATIN_MAP[character] ?? character)
        .join("");

    return normalizeText(transliterated);
};

const levenshteinDistance = (left, right) => {
    const matrix = Array.from({ length: left.length + 1 }, () =>
        Array(right.length + 1).fill(0)
    );

    for (let i = 0; i <= left.length; i++) {
        matrix[i][0] = i;
    }

    for (let j = 0; j <= right.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= left.length; i++) {
        for (let j = 1; j <= right.length; j++) {
            const cost = left[i - 1] === right[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[left.length][right.length];
};

// Scores the whole normalized string against the whole candidate, so a
// typo anywhere in the name (not just a prefix mismatch) still ranks
// sensibly. Combines edit distance, positional overlap, and a
// subsequence match so both "close by letters" and "close by shape"
// candidates surface.
const scoreSingle = (normalizedSearch, normalizedCandidate) => {
    if (!normalizedSearch || !normalizedCandidate) {
        return 0;
    }

    if (normalizedSearch === normalizedCandidate) {
        return 100;
    }

    const maxLength = Math.max(normalizedSearch.length, normalizedCandidate.length);

    if (maxLength === 0) {
        return 0;
    }

    const distance = levenshteinDistance(normalizedSearch, normalizedCandidate);
    const editScore = Math.max(0, 100 - (distance / maxLength) * 100);

    let positionMatches = 0;
    const comparisonLength = Math.min(
        normalizedSearch.length,
        normalizedCandidate.length
    );

    for (let index = 0; index < comparisonLength; index += 1) {
        if (normalizedSearch[index] === normalizedCandidate[index]) {
            positionMatches += 1;
        }
    }

    const positionScore = (positionMatches / maxLength) * 100;

    let longestCommonSubsequence = 0;
    let searchIndex = 0;

    while (searchIndex < normalizedSearch.length) {
        let candidateIndex = 0;

        while (candidateIndex < normalizedCandidate.length) {
            if (normalizedSearch[searchIndex] === normalizedCandidate[candidateIndex]) {
                longestCommonSubsequence += 1;
                searchIndex += 1;
                candidateIndex += 1;
                break;
            }

            candidateIndex += 1;
        }

        if (candidateIndex >= normalizedCandidate.length) {
            searchIndex += 1;
        }
    }

    const sequenceScore = (longestCommonSubsequence / maxLength) * 100;

    return Math.round(editScore * 0.65 + positionScore * 0.25 + sequenceScore * 0.1);
};

// Scores against both the as-typed search term and, when given, a
// transliterated form of it (used for Arabic input matched against a
// Latin-spelled result), taking whichever scores higher. Also checks
// the candidate's bare city name (ignoring region/country) since
// that's usually what the user actually typed.
const getSimilarityScore = (searchValue, candidateValue, alternateSearchValue = "") => {
    const normalizedCandidate = normalizeText(candidateValue);
    const candidateNameOnly = normalizeText(candidateValue.split(",")[0]);

    const candidatesToCompare = [normalizedCandidate, candidateNameOnly];
    const searchValuesToCompare = [normalizeText(searchValue)];

    if (alternateSearchValue) {
        searchValuesToCompare.push(normalizeText(alternateSearchValue));
    }

    let bestScore = 0;

    for (const normalizedSearch of searchValuesToCompare) {
        for (const candidate of candidatesToCompare) {
            bestScore = Math.max(bestScore, scoreSingle(normalizedSearch, candidate));
        }
    }

    return Math.min(100, bestScore);
};

const buildLocationLabel = (location) =>
    [location.name, location.admin1, location.country]
        .filter(Boolean)
        .join(", ");

// Generates a small, ranked set of likely spellings instead of every
// possible permutation. Ordered roughly by "most likely to still be a
// real word": common letter-confusion swaps first, single-letter
// deletions and transpositions last, truncated prefixes only as a
// last resort.
const generateTypoVariants = (value, maxVariants = MAX_SEARCH_VARIANTS) => {
    const cleanedValue = normalizeText(value);

    if (!cleanedValue) {
        return [];
    }

    const variants = new Set([cleanedValue]);

    const replacements = [
        ["ch", "sh"],
        ["sh", "ch"],
        ["c", "k"],
        ["k", "c"],
        ["q", "k"],
        ["ph", "f"],
        ["y", "i"],
        ["s", "z"],
        ["v", "w"],
        ["h", "kh"],
    ];

    for (const [source, target] of replacements) {
        if (variants.size >= maxVariants) break;
        if (cleanedValue.includes(source)) {
            variants.add(cleanedValue.replaceAll(source, target));
        }
    }

    for (let index = 0; index < cleanedValue.length && variants.size < maxVariants; index += 1) {
        variants.add(cleanedValue.slice(0, index) + cleanedValue.slice(index + 1));
    }

    for (
        let index = 0;
        index < cleanedValue.length - 1 && variants.size < maxVariants;
        index += 1
    ) {
        const swapped = cleanedValue.split("");
        [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
        variants.add(swapped.join(""));
    }

    if (cleanedValue.length > 4 && variants.size < maxVariants) {
        variants.add(cleanedValue.slice(0, cleanedValue.length - 1));
    }

    return Array.from(variants)
        .filter((variant) => variant.length >= 2)
        .slice(0, maxVariants);
};

// Runs lookups with a small concurrency cap rather than sequentially,
// so a multi-variant fallback search doesn't feel slow, while still
// not firing every request at once.
const runWithConcurrencyLimit = async (items, limit, worker) => {
    const results = [];
    let cursor = 0;

    const runNext = async () => {
        while (cursor < items.length) {
            const currentIndex = cursor;
            cursor += 1;
            results[currentIndex] = await worker(items[currentIndex]);
        }
    };

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        runNext
    );

    await Promise.all(workers);

    return results;
};

const fetchOpenMeteoResults = async (name, language) => {
    try {
        const response = await axios.get(GEOCODING_API_URL, {
            params: { name, count: 10, language, format: "json" },
        });

        return response.data.results || [];
    } catch (error) {
        console.warn("Open-Meteo lookup failed:", name, language, error);
        return [];
    }
};

// Tries an exact lookup across the language fallback order for the
// detected language, stopping at the first language that returns
// results. Keeps the "use detected language first" requirement while
// still recovering when a city isn't indexed under that language.
const searchWithLanguageFallback = async (cityName, languages) => {
    for (const language of languages) {
        const results = await fetchOpenMeteoResults(cityName, language);

        if (results.length > 0) {
            return { results, languageUsed: language };
        }
    }

    return { results: [], languageUsed: languages[0] };
};

const searchCityCandidates = async (variants, language) => {
    const uniqueResults = new Map();

    await runWithConcurrencyLimit(
        variants,
        MAX_VARIANT_REQUEST_CONCURRENCY,
        async (variant) => {
            const results = await fetchOpenMeteoResults(variant, language);

            results.forEach((location) => {
                if (!uniqueResults.has(location.id)) {
                    uniqueResults.set(location.id, location);
                }
            });
        }
    );

    return Array.from(uniqueResults.values());
};

const normalizeNominatimResult = (item, index) => ({
    id: `osm-${item.osm_id ?? index}`,
    name:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.display_name?.split(",")[0] ||
        item.name,
    admin1: item.address?.state || item.address?.region,
    country: item.address?.country,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
});

// Last-resort fallback when Open-Meteo returns nothing even after
// language and typo-variant retries. Nominatim's usage policy expects
// light, infrequent use and a way to identify the calling app, so this
// is only reached when every other option has failed.
const searchNominatimFallback = async (cityName) => {
    try {
        const response = await axios.get(NOMINATIM_API_URL, {
            params: {
                q: cityName,
                format: "json",
                addressdetails: 1,
                limit: 8,
            },
        });

        return (response.data || [])
            .filter((item) =>
                ["city", "town", "village", "administrative"].includes(
                    item.type
                ) || item.class === "place"
            )
            .map(normalizeNominatimResult);
    } catch (error) {
        console.warn("Nominatim fallback failed:", cityName, error);
        return [];
    }
};

function CitySearch({ onCitySelect }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (event) => {
        event.preventDefault();

        const cityName = searchTerm.trim();

        if (cityName.length < 2) {
            setError("Please enter at least 2 characters.");
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSearchResults([]);

            const detectedLanguage = detectLanguage(cityName);
            const languageOrder =
                LANGUAGE_FALLBACK_ORDER[detectedLanguage] || [detectedLanguage];

            // Arabic input also gets a Latin transliteration, used both
            // as an extra search term and as an extra signal when
            // scoring candidates (e.g. Open-Meteo entries stored in
            // Latin script).
            const transliteratedCityName =
                detectedLanguage === "ar" ? transliterateArabic(cityName) : "";

            let usedFallback = false;

            // 1. Exact lookup, cascading across fallback languages.
            let { results: rawResults } = await searchWithLanguageFallback(
                cityName,
                languageOrder
            );

            // 2. Typo-tolerant retry, including a transliterated base
            // variant for Arabic input.
            if (rawResults.length === 0) {
                usedFallback = true;

                const variantBases = [cityName];
                if (transliteratedCityName) {
                    variantBases.push(transliteratedCityName);
                }

                const variants = Array.from(
                    new Set(
                        variantBases.flatMap((base) => generateTypoVariants(base))
                    )
                ).slice(0, MAX_SEARCH_VARIANTS);

                rawResults = await searchCityCandidates(
                    variants,
                    transliteratedCityName ? "en" : detectedLanguage
                );
            }

            // 3. Last resort: a different geocoding source entirely.
            if (rawResults.length === 0) {
                usedFallback = true;
                rawResults = await searchNominatimFallback(
                    transliteratedCityName || cityName
                );
            }

            if (rawResults.length === 0) {
                setError("No cities found. Try another city name.");
                return;
            }

            const rankedResults = rawResults
                .map((location) => ({
                    location,
                    score: getSimilarityScore(
                        cityName,
                        buildLocationLabel(location),
                        transliteratedCityName
                    ),
                }))
                .sort((first, second) => second.score - first.score)
                .slice(0, MAX_RESULTS_SHOWN)
                .map((entry) => entry.location);

            const hasExactMatch = rankedResults.some(
                (location) =>
                    normalizeText(location.name) === normalizeText(cityName) ||
                    (transliteratedCityName &&
                        normalizeText(location.name) === transliteratedCityName)
            );

            setSearchResults(rankedResults);

            if (!hasExactMatch || usedFallback) {
                setError("No exact match found. Showing the closest city matches.");
            }
        } catch (searchError) {
            console.error("City Search Error:", searchError);
            setError("Unable to search for cities. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCitySelect = (location) => {
        onCitySelect(location);
        setSearchTerm(location.name);
        setSearchResults([]);
        setError("");
    };

    const detectedLanguage = detectLanguage(searchTerm);

    return (
        <section className="city-search">
            <h2>Search for a City</h2>

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    lang={detectedLanguage}
                    placeholder="Enter a city name..."
                    value={searchTerm}
                    onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setError("");
                        setSearchResults([]);
                    }}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {loading && <p>Searching for cities...</p>}

            {error && <p className="error">{error}</p>}

            {searchResults.length > 0 && (
                <div className="city-search-results">
                    <h3>Select a city:</h3>

                    {searchResults.map((location) => (
                        <button
                            type="button"
                            key={`${location.id}-${location.name}-${location.country}`}
                            className="city-search-result"
                            onClick={() => handleCitySelect(location)}
                        >
                            <strong>{location.name}</strong>

                            <span>
                                {location.admin1 ? `${location.admin1}, ` : ""}
                                {location.country}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}

export default CitySearch;