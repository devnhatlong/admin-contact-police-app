/**
 * Org Unit Schema - cây đơn vị tổ chức
 * Collection: org_units
 */

const { VISIBILITY_VALUES, DEFAULT_VISIBILITY, normalizeVisibility } = require("../constants/visibility");

const COLLECTION_NAME = "org_units";

const ORG_UNIT_TYPES = [
    "tinh",
    "phong",
    "xa",
    "phuong",
    "thi_tran",
    "doi",
    "to",
    "don",
    "tram",
];

const ORG_UNIT_TYPE_LABELS = {
    tinh: "Công an tỉnh",
    phong: "Phòng",
    xa: "Công an xã",
    phuong: "Công an phường",
    thi_tran: "Công an thị trấn",
    doi: "Đội",
    to: "Tổ",
    don: "Đồn",
    tram: "Trạm",
};

const CHILD_TYPES_BY_PARENT = {
    tinh: ["phong", "xa", "phuong", "thi_tran", "don", "tram"],
    phong: ["doi", "to"],
    xa: ["doi", "to"],
    phuong: ["doi", "to"],
    thi_tran: ["doi", "to"],
    doi: ["to"],
    to: [],
    don: ["to"],
    tram: ["to"],
};

const ORG_UNIT_SCHEMA = {
    code: { type: "string", required: true, description: "Mã đơn vị" },
    name: { type: "string", required: true, description: "Tên đầy đủ" },
    shortName: { type: "string", required: false },
    orgUnitType: { type: "string", enum: ORG_UNIT_TYPES, required: true },
    parentId: { type: "string", nullable: true, ref: "org_units._id" },
    orgPath: { type: "array", items: "string" },
    sortOrder: { type: "number", default: 0 },
    isActive: { type: "boolean", default: true },
    visibility: { type: "string", enum: VISIBILITY_VALUES, default: DEFAULT_VISIBILITY },
    cap: { type: "number", required: false, nullable: true, description: "Cấp hành chính (tương đương communes.cap)" },
    ma_tinh: { type: "string", required: false, nullable: true },
    ten_tinh: { type: "string", required: false, nullable: true },
    dan_so: { type: "number", required: false, nullable: true },
    dtich_km2: { type: "number", required: false, nullable: true },
    matdo_km2: { type: "number", required: false, nullable: true },
    address: { type: "string", required: false, nullable: true },
    tru_so: { type: "string", required: false, nullable: true },
    sap_nhap: { type: "string", required: false, nullable: true },
    unitProfile: {
        type: "object",
        required: false,
        fields: {
            chief: { type: "string", nullable: true, description: "Trưởng phòng / Trưởng CA xã" },
            hotline: { type: "string", nullable: true, description: "SĐT đơn vị hiển thị danh bạ" },
        },
    },
};

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
        if (!data.orgUnitType || !ORG_UNIT_TYPES.includes(data.orgUnitType)) {
            errors.push(`orgUnitType must be one of: ${ORG_UNIT_TYPES.join(", ")}`);
        }
    }

    if (data.orgUnitType && !ORG_UNIT_TYPES.includes(data.orgUnitType)) {
        errors.push(`orgUnitType must be one of: ${ORG_UNIT_TYPES.join(", ")}`);
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

const sanitizeUnitProfile = (profile) => {
    if (!profile || typeof profile !== "object") {
        return { chief: null, hotline: null };
    }
    return {
        chief: trimOrNull(profile.chief),
        hotline: trimOrNull(profile.hotline),
    };
};

const sanitizeOrgUnitInput = (data) => ({
    code: data.code?.trim(),
    name: data.name?.trim(),
    shortName: data.shortName?.trim() || null,
    orgUnitType: data.orgUnitType,
    parentId: data.parentId || null,
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    visibility: normalizeVisibility(data.visibility),
    cap: parseOptionalNumber(data.cap),
    ma_tinh: trimOrNull(data.ma_tinh),
    ten_tinh: trimOrNull(data.ten_tinh),
    dan_so: parseOptionalNumber(data.dan_so),
    dtich_km2: parseOptionalNumber(data.dtich_km2),
    matdo_km2: parseOptionalNumber(data.matdo_km2),
    address: trimOrNull(data.address) || trimOrNull(data.unitProfile?.address),
    tru_so: trimOrNull(data.tru_so) || trimOrNull(data.unitProfile?.truSo),
    sap_nhap: trimOrNull(data.sap_nhap),
    unitProfile: sanitizeUnitProfile(data.unitProfile),
});

const getDefaultOrgUnitData = () => ({
    sortOrder: 0,
    isActive: true,
    visibility: DEFAULT_VISIBILITY,
    cap: null,
    ma_tinh: null,
    ten_tinh: null,
    dan_so: null,
    dtich_km2: null,
    matdo_km2: null,
    address: null,
    tru_so: null,
    sap_nhap: null,
    unitProfile: {
        chief: null,
        hotline: null,
    },
});

module.exports = {
    COLLECTION_NAME,
    ORG_UNIT_SCHEMA,
    ORG_UNIT_TYPES,
    ORG_UNIT_TYPE_LABELS,
    CHILD_TYPES_BY_PARENT,
    mapLoaiToOrgType,
    validateOrgUnit,
    sanitizeOrgUnitInput,
    sanitizeUnitProfile,
    getDefaultOrgUnitData,
};
