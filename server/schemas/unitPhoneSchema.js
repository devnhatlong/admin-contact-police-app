/**
 * Số điện thoại thuộc đơn vị tổ chức (không gắn tài khoản CBCS)
 * Collection: unit_phones
 */

const COLLECTION_NAME = "unit_phones";

const UNIT_PHONE_SCHEMA = {
    orgUnitId: { type: "string", required: true, ref: "org_units._id" },
    label: { type: "string", required: false, nullable: true, description: "Nhãn: Tổng đài, Trực ban..." },
    phone: { type: "string", required: true },
    sortOrder: { type: "number", default: 0 },
    isActive: { type: "boolean", default: true, description: "Hiện/ẩn số điện thoại" },
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

    return errors;
};

const sanitizeUnitPhoneInput = (data) => ({
    orgUnitId: data.orgUnitId?.trim(),
    label: trimOrNull(data.label),
    phone: data.phone?.trim(),
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
});

module.exports = {
    COLLECTION_NAME,
    UNIT_PHONE_SCHEMA,
    validateUnitPhone,
    sanitizeUnitPhoneInput,
};
