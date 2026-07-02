const VISIBILITY = {
    PUBLIC: "public",
    INTERNAL: "internal",
};

const VISIBILITY_VALUES = Object.values(VISIBILITY);

const DEFAULT_VISIBILITY = VISIBILITY.INTERNAL;

const matchesVisibilityScope = (item, scope = "all") => {
    const visibility = item?.visibility || DEFAULT_VISIBILITY;

    if (scope === "all") return true;
    if (scope === "public") return visibility === VISIBILITY.PUBLIC;
    if (scope === "authenticated") {
        return visibility === VISIBILITY.PUBLIC || visibility === VISIBILITY.INTERNAL;
    }

    return true;
};

const normalizeVisibility = (value) => {
    if (value === undefined || value === null || value === "") {
        return DEFAULT_VISIBILITY;
    }

    const normalized = String(value).trim().toLowerCase();

    if (VISIBILITY_VALUES.includes(normalized)) {
        return normalized;
    }

    const aliasMap = {
        "công khai": VISIBILITY.PUBLIC,
        "cong khai": VISIBILITY.PUBLIC,
        "public": VISIBILITY.PUBLIC,
        "nội bộ": VISIBILITY.INTERNAL,
        "noi bo": VISIBILITY.INTERNAL,
        "private": VISIBILITY.INTERNAL,
        "internal": VISIBILITY.INTERNAL,
    };

    return aliasMap[normalized] || DEFAULT_VISIBILITY;
};

module.exports = {
    VISIBILITY,
    VISIBILITY_VALUES,
    DEFAULT_VISIBILITY,
    matchesVisibilityScope,
    normalizeVisibility,
};
