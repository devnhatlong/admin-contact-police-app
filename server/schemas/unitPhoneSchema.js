/**
 * Số điện thoại thuộc đơn vị tổ chức (không gắn tài khoản CBCS)
 * Collection: unit_phones
 */

const { VISIBILITY_VALUES, DEFAULT_VISIBILITY, normalizeVisibility } = require("../constants/visibility");

const COLLECTION_NAME = "unit_phones";

const UNIT_PHONE_SCHEMA = {
    orgUnitId: { type: "string", required: true, ref: "org_units._id" },
    label: { type: "string", required: false, nullable: true, description: "Nhãn: Tổng đài, Trực ban..." },
    phone: { type: "string", required: true },
    sortOrder: { type: "number", default: 0 },
    isListed: { type: "boolean", default: true, description: "Hiện/ẩn trong Danh bạ app" },
    visibility: { type: "string", enum: VISIBILITY_VALUES, default: DEFAULT_VISIBILITY },
    isActive: { type: "boolean", default: true },
};

const trimOrNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

const validateUnitPhone = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.orgUnitId || !String(data.orgUnitId).trim()) {
            errors.push("orgUnitId is required");
        }
        if (!data.phone || !String(data.phone).trim()) {
            errors.push("phone is required");
        }
    }

    if (data.phone !== undefined && !String(data.phone).trim()) {
        errors.push("phone must be a non-empty string");
    }

    if (data.visibility !== undefined && data.visibility !== null) {
        if (!VISIBILITY_VALUES.includes(normalizeVisibility(data.visibility))) {
            errors.push(`visibility must be one of: ${VISIBILITY_VALUES.join(", ")}`);
        }
    }

    return errors;
};

const sanitizeUnitPhoneInput = (data) => ({
    orgUnitId: data.orgUnitId?.trim(),
    label: trimOrNull(data.label),
    phone: data.phone?.trim(),
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isListed: data.isListed !== undefined ? Boolean(data.isListed) : true,
    visibility: normalizeVisibility(data.visibility),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
});

module.exports = {
    COLLECTION_NAME,
    UNIT_PHONE_SCHEMA,
    validateUnitPhone,
    sanitizeUnitPhoneInput,
};
