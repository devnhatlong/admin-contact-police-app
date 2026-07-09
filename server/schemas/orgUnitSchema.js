/**
 * Org Unit Schema - cây đơn vị tổ chức
 * Collection: org_units
 */

const { VISIBILITY_VALUES, DEFAULT_VISIBILITY, normalizeVisibility } = require("../constants/visibility");

const COLLECTION_NAME = "org_units";

const ORG_UNIT_TYPE_LABELS = {
    tinh: "Công an tỉnh",
    phong: "Phòng",
    xa: "Công an xã",
    phuong: "Công an phường",
    thi_tran: "Công an thị trấn",
    dackhu: "Công an đặc khu",
    doi: "Đội",
    to: "Tổ",
    don: "Đồn",
    tram: "Trạm",
};

const CHILD_TYPES_BY_PARENT = {
    tinh: ["phong", "xa", "phuong", "thi_tran", "dackhu", "don", "tram"],
    phong: ["doi", "to"],
    xa: ["doi", "to"],
    phuong: ["doi", "to"],
    thi_tran: ["doi", "to"],
    dackhu: ["doi", "to"],
    doi: ["to"],
    to: [],
    don: ["doi", "to"],
    tram: ["doi", "to"]
};

const ORG_UNIT_SCHEMA = {
    code: { type: "string", required: true, description: "Mã đơn vị" },
    name: { type: "string", required: true, description: "Tên đầy đủ" },
    orgUnitType: { type: "string", required: true, description: "Loại đơn vị" },
    parentId: { type: "string", nullable: true, ref: "org_units._id" },
    orgPath: { type: "array", items: "string" },
    sortOrder: { type: "number", default: 0 },
    isActive: { type: "boolean", default: true },
    visibility: { type: "string", enum: VISIBILITY_VALUES, default: DEFAULT_VISIBILITY },
};

const GEO_PROFILE_SCHEMA = {
    cap: { type: "number", required: false, nullable: true, description: "Cấp hành chính" },
    ma_tinh: { type: "string", required: false, nullable: true },
    ten_tinh: { type: "string", required: false, nullable: true },
    dan_so: { type: "number", required: false, nullable: true },
    dtich_km2: { type: "number", required: false, nullable: true },
    matdo_km2: { type: "number", required: false, nullable: true },
    address: { type: "string", required: false, nullable: true, description: "Địa chỉ" },
    tru_so: { type: "string", required: false, nullable: true, description: "Trụ sở" },
    sap_nhap: { type: "string", required: false, nullable: true, description: "Sáp nhập" },
};

const LEGACY_GEO_FIELD_KEYS = Object.keys(GEO_PROFILE_SCHEMA);

const mapLoaiToOrgType = (loai = "") => {
    const normalized = String(loai).trim().toLowerCase();
    if (normalized.includes("phường") || normalized === "phuong") return "phuong";
    if (normalized.includes("thị trấn") || normalized === "thi_tran") return "thi_tran";
    if (normalized.includes("xã") || normalized === "xa") return "xa";
    if (normalized.includes("phòng") || normalized === "phong") return "phong";
    return "xa";
};

const validateOrgUnit = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
            errors.push("code is required");
        }
        if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
            errors.push("name is required");
        }
        if (!data.orgUnitType || typeof data.orgUnitType !== "string" || !data.orgUnitType.trim()) {
            errors.push("orgUnitType is required");
        }
    }

    if (data.orgUnitType !== undefined && data.orgUnitType !== null) {
        if (typeof data.orgUnitType !== "string" || !data.orgUnitType.trim()) {
            errors.push("orgUnitType must be a non-empty string");
        }
    }

    if (data.visibility !== undefined && data.visibility !== null) {
        if (!VISIBILITY_VALUES.includes(normalizeVisibility(data.visibility))) {
            errors.push(`visibility must be one of: ${VISIBILITY_VALUES.join(", ")}`);
        }
    }

    return { isValid: errors.length === 0, errors };
};

const parseOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const trimOrNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

const sanitizeGeoProfile = (data = {}) => {
    const profile = data.geoProfile && typeof data.geoProfile === "object" ? data.geoProfile : {};
    return {
        cap: parseOptionalNumber(profile.cap ?? data.cap),
        ma_tinh: trimOrNull(profile.ma_tinh ?? data.ma_tinh),
        ten_tinh: trimOrNull(profile.ten_tinh ?? data.ten_tinh),
        dan_so: parseOptionalNumber(profile.dan_so ?? data.dan_so),
        dtich_km2: parseOptionalNumber(profile.dtich_km2 ?? data.dtich_km2),
        matdo_km2: parseOptionalNumber(profile.matdo_km2 ?? data.matdo_km2),
        address: trimOrNull(profile.address ?? data.address),
        tru_so: trimOrNull(profile.tru_so ?? data.tru_so),
        sap_nhap: trimOrNull(profile.sap_nhap ?? data.sap_nhap),
    };
};

const getDefaultGeoProfile = () => ({
    cap: null,
    ma_tinh: null,
    ten_tinh: null,
    dan_so: null,
    dtich_km2: null,
    matdo_km2: null,
    address: null,
    tru_so: null,
    sap_nhap: null,
});

const sanitizeOrgUnitInput = (data) => ({
    code: data.code?.trim(),
    name: data.name?.trim(),
    orgUnitType: data.orgUnitType?.trim(),
    parentId: data.parentId || null,
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    visibility: normalizeVisibility(data.visibility),
});

const getDefaultOrgUnitData = () => ({
    sortOrder: 0,
    isActive: true,
    visibility: DEFAULT_VISIBILITY,
});

module.exports = {
    COLLECTION_NAME,
    ORG_UNIT_SCHEMA,
    GEO_PROFILE_SCHEMA,
    LEGACY_GEO_FIELD_KEYS,
    ORG_UNIT_TYPE_LABELS,
    CHILD_TYPES_BY_PARENT,
    mapLoaiToOrgType,
    validateOrgUnit,
    sanitizeOrgUnitInput,
    sanitizeGeoProfile,
    getDefaultGeoProfile,
    getDefaultOrgUnitData,
};
