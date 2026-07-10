/**
 * Số điện thoại thuộc đơn vị tổ chức (không gắn tài khoản CBCS)
 * Collection: unit_phones
 *
 * 1 document = 1 người/mục hiển thị + nhiều SĐT
 */

const COLLECTION_NAME = "unit_phones";

const { normalizeCode } = require("./jobPositionSchema");

const UNIT_PHONE_SCHEMA = {
    orgUnitId: { type: "string", required: true, ref: "org_units._id" },
    displayName: { type: "string", required: false, nullable: true, description: "Tên hiển thị trên danh bạ (VD: Trực ban, tên thủ trưởng...)" },
    positionType: { type: "string", required: false, nullable: true, description: "Mã chức vụ (code) trong job_positions, ví dụ: truong_phong" },
    phones: { type: "array", items: "string", required: true, description: "Danh sách số điện thoại" },
    sortOrder: { type: "number", default: 0 },
    isActive: { type: "boolean", default: true, description: "Hiện/ẩn mục danh bạ" },
};

const trimOrNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

const normalizePhones = (data = {}) => {
    if (Array.isArray(data.phones)) {
        return data.phones
            .map((item) => (item === undefined || item === null ? "" : String(item).trim()))
            .filter(Boolean);
    }
    // Tương thích dữ liệu cũ: field phone (string)
    if (data.phone !== undefined && data.phone !== null && String(data.phone).trim()) {
        return [String(data.phone).trim()];
    }
    return [];
};

const validateUnitPhone = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.orgUnitId || !String(data.orgUnitId).trim()) {
            errors.push("orgUnitId is required");
        }
        const phones = normalizePhones(data);
        if (!phones.length) {
            errors.push("phones is required (at least 1 phone)");
        }
    }

    if (data.phones !== undefined || data.phone !== undefined) {
        const phones = normalizePhones(data);
        if (!phones.length) {
            errors.push("phones must contain at least 1 non-empty phone");
        }
    }

    return errors;
};

const sanitizeUnitPhoneInput = (data) => ({
    orgUnitId: data.orgUnitId?.trim(),
    displayName: trimOrNull(data.displayName ?? data.label),
    positionType: data.positionType !== undefined && data.positionType !== null && String(data.positionType).trim()
        ? normalizeCode(data.positionType)
        : null,
    phones: normalizePhones(data),
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
});

module.exports = {
    COLLECTION_NAME,
    UNIT_PHONE_SCHEMA,
    normalizePhones,
    validateUnitPhone,
    sanitizeUnitPhoneInput,
};
